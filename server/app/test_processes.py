
import time
from app.process_handler import ProcessManager

def test_email_process():
    print("\n" + "="*60)
    print("TEST 1: Bulk Email Sending")
    print("="*60)
    
    manager = ProcessManager()
    
    email_tasks = [
        {
            "to": "student1@test.com",
            "subject": "Dobrodošli na platformu",
            "body": "Zdravo! Dobrodošao na našu platformu za učenje."
        },
        {
            "to": "student2@test.com",
            "subject": "Novi zadatak u kursu",
            "body": "Dodat je novi zadatak. Krajnji rok je sledeće nedelje."
        },
        {
            "to": "student3@test.com",
            "subject": "Ocena za zadatak",
            "body": "Tvoj zadatak je ocenjen sa 5/5. Odličan posao!"
        }
    ]
    
    print(f"\n📧 Starting email process with {len(email_tasks)} emails...")
    process = manager.send_bulk_emails(email_tasks)
    
    print("⏳ Waiting for process to complete...")
    manager.wait_for_completion(timeout=10)
    
    results = manager.get_results()
    print(f"\n✅ Results: {len(results)} batch(es) completed")
    for result in results:
        print(f"   Process: {result['process']}")
        print(f"   Emails sent: {result['completed']}")
    
    print("\n" + "="*60)


def test_report_generation():
    """Test generisanja izveštaja u odvojenom procesu"""
    print("\n" + "="*60)
    print("TEST 2: Report Generation")
    print("="*60)
    
    manager = ProcessManager()
    
    report_data = {
        "courses": 15,
        "students": 120,
        "professors": 8,
        "tasks": 45,
        "submissions": 340
    }
    
    print(f"\n📊 Starting report generation process...")
    process = manager.generate_report("platform_stats", report_data)
    
    print("⏳ Waiting for report generation...")
    manager.wait_for_completion(timeout=10)
    
    results = manager.get_results()
    print(f"\n✅ Report generated successfully")
    for result in results:
        print(f"   Type: {result['type']}")
        print(f"   Status: {result['status']}")
        print(f"   Generated at: {result.get('generated_at', 'N/A')}")
    
    print("\n" + "="*60)


def test_file_processing():
    """Test obrade fajla u odvojenom procesu"""
    print("\n" + "="*60)
    print("TEST 3: File Processing")
    print("="*60)
    
    manager = ProcessManager()
    
    test_file = "/tmp/test_submissions.csv"
    
    print(f"\n📄 Starting file processing: {test_file}")
    process = manager.process_file(test_file, operation="validate")
    
    print("⏳ Waiting for file processing...")
    manager.wait_for_completion(timeout=10)
    
    results = manager.get_results()
    print(f"\n✅ File processing completed")
    for result in results:
        print(f"   File: {result['file']}")
        print(f"   Operation: {result['operation']}")
        print(f"   Status: {result['status']}")
        print(f"   Lines processed: {result.get('lines_processed', 0)}")
    
    print("\n" + "="*60)


def test_parallel_processes():
    """Test pokretanja više procesa paralelno"""
    print("\n" + "="*60)
    print("TEST 4: Parallel Process Execution")
    print("="*60)
    
    manager = ProcessManager()
    
    print("\n🚀 Starting multiple processes in parallel...")
    
    email_tasks = [
        {"to": f"user{i}@test.com", "subject": "Test", "body": "Test email"}
        for i in range(5)
    ]
    p1 = manager.send_bulk_emails(email_tasks)
    
    p2 = manager.generate_report("test_report", {"test": "data"})
    
    p3 = manager.process_file("/tmp/test.csv", "parse")
    
    print(f"\n📊 Active processes: {manager.get_active_count()}")
    
    print("\n⏳ Waiting for all processes to complete...")
    manager.wait_for_completion(timeout=15)
    
    results = manager.get_results()
    print(f"\n✅ All processes completed. Total results: {len(results)}")
    
    for i, result in enumerate(results, 1):
        print(f"\n   Result {i}:")
        print(f"   - Type: {result.get('process', result.get('type', 'unknown'))}")
        print(f"   - Status: {result.get('status', 'completed')}")
    
    print("\n" + "="*60)


def main():
    """Pokreće sve testove"""
    print("\n" + "#"*60)
    print("#" + " "*58 + "#")
    print("#" + "  MULTIPROCESSING DEMONSTRATION - Learning Platform".center(58) + "#")
    print("#" + " "*58 + "#")
    print("#"*60)
    
    try:
        test_email_process()
        time.sleep(1)
        
        test_report_generation()
        time.sleep(1)
        
        test_file_processing()
        time.sleep(1)
        
        test_parallel_processes()
        
        print("\n" + "#"*60)
        print("#" + " "*58 + "#")
        print("#" + "  ALL TESTS COMPLETED SUCCESSFULLY! ✅".center(58) + "#")
        print("#" + " "*58 + "#")
        print("#"*60 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during tests: {e}")


if __name__ == "__main__":
    main()