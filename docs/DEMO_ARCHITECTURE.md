# Demo architecture

```
Supplied CSV datasets
      |
      v
scripts/build_data.py
      |
      v
src/data/demoData.json
      |
      +------------------+
      |                  |
      v                  v
Operator UI         Supervisor UI
      |                  |
      +------ shared ----+
             state
        tasks / issues
             |
             v
     live timer simulator
```

The mobile demo is intentionally backend-free. In the full blueprint, the shared state becomes the REST + Socket.IO API/event stream and the timer simulator becomes the Site Simulator/MQTT feed.
