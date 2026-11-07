# Phase 01 — Electrical Fundamentals

## Core quantities

- Voltage ($V$): electrical potential difference.
- Current ($I$): rate of electric charge flow.
- Resistance ($R$): opposition to current.
- DC: current direction is normally constant; used by PV panels and batteries.
- AC: voltage and current alternate; used by distribution networks and buildings.

## Power relationships

For DC:

$$P = VI$$

For balanced three-phase AC:

$$P = \sqrt{3} VI\cos\phi$$

where $P$ is active power in watts, $VI$ is apparent power in volt-amperes, and $\cos\phi$ is power factor.

- **kW** measures active power at an instant.
- **kWh** measures energy accumulated over time: $E = P \times t$.

## Worked example

A DC panel produces 48.0 V and 2.5 A:

$$P = 48 \times 2.5 = 120\ \text{W}$$

If it operates at 120 W for 5 hours:

$$E = 120 \times 5 = 600\ \text{Wh} = 0.6\ \text{kWh}$$

## Solar and the feeder

- PV power flows through an inverter and into the installation.
- At low local demand, export to the distribution feeder increases.
- Exported active power can raise voltage along a feeder, especially toward distant nodes.
- A battery can absorb excess energy or discharge when demand rises.
- Voltage must be constrained within the applicable regulator-approved limits before commands are issued.

## Safety

This project simulation does not validate real electrical equipment. Never connect an ESP32 or hobby sensor directly to household/grid AC. Physical measurements require isolated, rated instrumentation and qualified supervision.

## Phase 01 deliverable

The five-site model should separately track PV generation, local load, net import/export, voltage, battery charge, and energy over time.
