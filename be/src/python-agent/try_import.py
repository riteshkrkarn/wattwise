try:
    import google_adk
    print("Successfully imported google_adk")
    print(dir(google_adk))
except ImportError:
    print("Failed to import google_adk")
    # Try alternate naming
    try:
        import google.adk
        print("Successfully imported google.adk")
        print(dir(google.adk))
    except ImportError:
        print("Failed to import google.adk")
