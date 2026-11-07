# The Sun Solar Operations Dashboard

A responsive TypeScript dashboard and Python feeder-simulation foundation for a five-site centralized solar management system.

## Implemented foundation

- Five-site operator dashboard
- Phase 01 electrical fundamentals and worked calculations
- Five-bus radial feeder built with pandapower
- Five independent virtual device measurements
- Voltage and line-loading constraint reporting
- Safety guidance for low-voltage simulation and physical hardware

## Run the frontend

```sh
npm install
npm run dev
```

## Run the power simulations

```sh
python3 -m pip install -r requirements.txt
python3 power-system/network_model.py
python3 device-simulator/site_simulation.py
```

A production frontend build can be created with `npm run build`.
# THE-SUN
