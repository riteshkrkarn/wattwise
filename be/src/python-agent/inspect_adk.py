import pkg_resources
import sys

package_name = 'google-adk'
try:
    dist = pkg_resources.get_distribution(package_name)
    print(f"Found {package_name} at {dist.location}")
    # Inspect top-level names
    if dist.has_metadata('top_level.txt'):
        print("Top level modules:", dist.get_metadata('top_level.txt'))
except Exception as e:
    print(e)
