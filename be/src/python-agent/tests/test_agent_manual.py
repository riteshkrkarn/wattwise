import subprocess
import json
import os

# Sample Input Data (Simulating a Normalized Bill Record Breakdown)
sample_input = {
    "breakdown": [
        {
            "name": "Air Conditioner",
            "count": 2,
            "hours": 8,
            "watts": 1500,
            "monthlyUnits": 720,
            "estimatedCost": 7200  # High cost, should trigger a reduction suggestion
        },
        {
            "name": "LED Bulb",
            "count": 10,
            "hours": 6,
            "watts": 10,
            "monthlyUnits": 18,
            "estimatedCost": 180   # Low cost, likely no huge reduction
        },
        {
            "name": "Refrigerator",
            "count": 1,
            "hours": 24,
            "watts": 200,
            "monthlyUnits": 144,
            "estimatedCost": 1440
        }
    ]
}

def test_agent():
    print("--- Starting Agent Test ---")
    
    # Path to agent.py
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up one level to find agent.py
    agent_path = os.path.join(current_dir, '..', 'agent.py')
    
    # Prepare input
    input_json = json.dumps(sample_input)
    
    try:
        # Run agent.py via subprocess
        process = subprocess.Popen(
            ['python', agent_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=input_json)
        
        if process.returncode != 0:
            print("❌ Agent Failed!")
            print("Error Error:", stderr)
            return

        print("✅ Agent Execution Successful!")
        print("\n--- Agent Output ---")
        
        # Parse Output to verify structure
        try:
            output_data = json.loads(stdout)
            print(json.dumps(output_data, indent=2))
            
            # Basic Assertions
            if "carbonFootprint" in output_data and "suggestions" in output_data:
                print("\n✅ Output Structure Verified (carbonFootprint & suggestions present)")
            else:
                print("\n⚠️ Unexpected Output Structure")
                
        except json.JSONDecodeError:
            print("❌ Failed to parse JSON output")
            print("Raw Output:", stdout)

    except Exception as e:
        print(f"❌ Test Script Error: {e}")

if __name__ == "__main__":
    test_agent()
