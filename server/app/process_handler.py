
import os
import time
from multiprocessing import Process, Queue, current_process
from datetime import datetime
from typing import List, Dict, Any


def send_bulk_emails_worker(tasks: List[Dict[str, Any]], result_queue: Queue):
  
    process_name = current_process().name
    print(f"[{process_name}] Started email sending process")
    
    results = []
    for task in tasks:
        try:
            to = task.get('to')
            subject = task.get('subject')
            body = task.get('body')
            
            print(f"[{process_name}] Sending email to {to}")
            time.sleep(0.5)  
            
            results.append({
                'to': to,
                'status': 'sent',
                'timestamp': datetime.utcnow().isoformat()
            })
            
        except Exception as e:
            print(f"[{process_name}] Error sending email: {e}")
            results.append({
                'to': task.get('to', 'unknown'),
                'status': 'failed',
                'error': str(e)
            })
    
    result_queue.put({
        'process': process_name,
        'completed': len(results),
        'results': results
    })
    
    print(f"[{process_name}] Completed sending {len(results)} emails")


def generate_report_worker(report_type: str, data: Dict[str, Any], result_queue: Queue):
    process_name = current_process().name
    print(f"[{process_name}] Started generating {report_type} report")
    
    try:
        time.sleep(2)  
        
        report = {
            'type': report_type,
            'generated_at': datetime.utcnow().isoformat(),
            'data': data,
            'status': 'completed'
        }
        
        result_queue.put(report)
        print(f"[{process_name}] Report generated successfully")
        
    except Exception as e:
        print(f"[{process_name}] Error generating report: {e}")
        result_queue.put({
            'type': report_type,
            'status': 'failed',
            'error': str(e)
        })


def process_file_worker(file_path: str, operation: str, result_queue: Queue):
    process_name = current_process().name
    print(f"[{process_name}] Started processing file: {file_path}")
    
    try:
        time.sleep(1)
        
        result = {
            'file': file_path,
            'operation': operation,
            'processed_at': datetime.utcnow().isoformat(),
            'status': 'completed',
            'lines_processed': 1000,  # Simulacija
            'errors': 0
        }
        
        result_queue.put(result)
        print(f"[{process_name}] File processing completed")
        
    except Exception as e:
        print(f"[{process_name}] Error processing file: {e}")
        result_queue.put({
            'file': file_path,
            'status': 'failed',
            'error': str(e)
        })


class ProcessManager:
    def __init__(self):
        self.active_processes: List[Process] = []
        self.result_queue = Queue()
    
    def send_bulk_emails(self, email_tasks: List[Dict[str, Any]]) -> Process:
        process = Process(
            target=send_bulk_emails_worker,
            args=(email_tasks, self.result_queue),
            name=f"EmailWorker-{len(self.active_processes)}"
        )
        process.start()
        self.active_processes.append(process)
        
        print(f"✅ Started email process: {process.name} (PID: {process.pid})")
        return process
    
    def generate_report(self, report_type: str, data: Dict[str, Any]) -> Process:
        process = Process(
            target=generate_report_worker,
            args=(report_type, data, self.result_queue),
            name=f"ReportWorker-{len(self.active_processes)}"
        )
        process.start()
        self.active_processes.append(process)
        
        print(f"✅ Started report process: {process.name} (PID: {process.pid})")
        return process
    
    def process_file(self, file_path: str, operation: str = "validate") -> Process:
        process = Process(
            target=process_file_worker,
            args=(file_path, operation, self.result_queue),
            name=f"FileWorker-{len(self.active_processes)}"
        )
        process.start()
        self.active_processes.append(process)
        
        print(f"✅ Started file process: {process.name} (PID: {process.pid})")
        return process
    
    def get_results(self, timeout: float = 0.1) -> List[Dict[str, Any]]:
        results = []
        while not self.result_queue.empty():
            try:
                result = self.result_queue.get(timeout=timeout)
                results.append(result)
            except:
                break
        return results
    
    def wait_for_completion(self, timeout: float = None):
        for process in self.active_processes:
            process.join(timeout=timeout)
            if process.is_alive():
                print(f"⚠️  Process {process.name} still running")
            else:
                print(f"✅ Process {process.name} completed")
        
        self.active_processes = [p for p in self.active_processes if p.is_alive()]
    
    def terminate_all(self):
        for process in self.active_processes:
            if process.is_alive():
                print(f"🛑 Terminating process {process.name}")
                process.terminate()
                process.join(timeout=1)
        
        self.active_processes.clear()
    
    def get_active_count(self) -> int:
        return len([p for p in self.active_processes if p.is_alive()])


process_manager = ProcessManager()


def cleanup_processes():
    print("\n🧹 Cleaning up background processes...")
    process_manager.terminate_all()
    print("✅ All processes terminated")


import atexit
atexit.register(cleanup_processes)