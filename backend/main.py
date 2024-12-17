from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from collections import deque
import heapq

# إنشاء تطبيق FastAPI
app = FastAPI()

# تفعيل CORS للسماح بالتواصل مع الواجهة الأمامية
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # السماح لجميع النطاقات - غيّره للإنتاج
    allow_credentials=True,
    allow_methods=["*"],  # السماح بجميع طرق HTTP
    allow_headers=["*"],  # السماح بجميع الرؤوس
)

# تعريف نموذج البيانات المدخلة
class SimulationInput(BaseModel):
    lambda_rate: float
    service_rates: List[float]
    num_servers: List[int]
    simulation_time: float

# كلاس المحاكاة
class SerialQueueSimulation:
    def __init__(self, lambda_rate, service_rates, num_servers):
        self.lambda_rate = lambda_rate
        self.service_rates = service_rates
        self.num_servers = num_servers
        self.num_stations = len(service_rates)
        
        for i in range(self.num_stations):
            if num_servers[i] * service_rates[i] <= lambda_rate:
                raise ValueError(f"Stability condition not met for station {i}")
        
        self.queues = [deque() for _ in range(self.num_stations)]
        self.servers_busy = [0 for _ in range(self.num_stations)]
        self.event_queue = []
        self.current_time = 0
        
        self.total_customers = 0
        self.total_time_in_system = 0
        self.time_integrated_customers = 0
        self.last_event_time = 0

    def generate_interarrival_time(self):
        return np.random.exponential(1 / self.lambda_rate)

    def generate_service_time(self, station):
        return np.random.exponential(1 / self.service_rates[station])

    def update_stats(self):
        total_customers = sum(len(q) for q in self.queues) + sum(self.servers_busy)
        time_diff = self.current_time - self.last_event_time
        self.time_integrated_customers += total_customers * time_diff
        self.last_event_time = self.current_time

    def schedule_arrival(self):
        arrival_time = self.current_time + self.generate_interarrival_time()
        heapq.heappush(self.event_queue, (arrival_time, 'arrival', None))

    def schedule_departure(self, station, customer_id):
        departure_time = self.current_time + self.generate_service_time(station)
        heapq.heappush(self.event_queue, (departure_time, 'departure', (station, customer_id)))

    def handle_arrival(self):
        self.total_customers += 1
        customer_id = self.total_customers
        if self.servers_busy[0] < self.num_servers[0]:
            self.servers_busy[0] += 1
            self.schedule_departure(0, customer_id)
        else:
            self.queues[0].append((customer_id, self.current_time))

    def handle_departure(self, station, customer_id):
        self.servers_busy[station] -= 1
        if self.queues[station]:
            waiting_customer = self.queues[station].popleft()
            self.servers_busy[station] += 1
            self.schedule_departure(station, waiting_customer[0])

        if station < self.num_stations - 1:
            next_station = station + 1
            if self.servers_busy[next_station] < self.num_servers[next_station]:
                self.servers_busy[next_station] += 1
                self.schedule_departure(next_station, customer_id)
            else:
                self.queues[next_station].append((customer_id, self.current_time))
        else:
            self.total_time_in_system += self.current_time - self.current_time

    def run_simulation(self, simulation_time):
        self.schedule_arrival()
        while self.event_queue and self.current_time < simulation_time:
            self.update_stats()
            self.current_time, event_type, event_data = heapq.heappop(self.event_queue)
            if event_type == 'arrival':
                self.handle_arrival()
                self.schedule_arrival()
            else:
                station, customer_id = event_data
                self.handle_departure(station, customer_id)
        
        L = self.time_integrated_customers / simulation_time
        W = self.total_time_in_system / self.total_customers if self.total_customers > 0 else 0
        return {"L": L, "W": W}

# نقطة النهاية لتشغيل المحاكاة
@app.post("/simulate/")
async def simulate(data: SimulationInput):
    try:
        simulation = SerialQueueSimulation(data.lambda_rate, data.service_rates, data.num_servers)
        results = simulation.run_simulation(data.simulation_time)
        return results
    except ValueError as e:
        return {"error": str(e)}
