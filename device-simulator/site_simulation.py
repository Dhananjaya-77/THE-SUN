"""Five deterministic virtual site measurements for local development."""
from datetime import datetime, timezone
import json
from site_config import SITE_CONFIGS


def simulate_sites() -> list[dict]:
    now = datetime.now(timezone.utc).isoformat()
    measurements = []
    for site_id, config in SITE_CONFIGS.items():
        net_kw = config["pv_kw"] - config["load_kw"]
        voltage_v = 400.0 + site_id * 0.7
        measurements.append({
            "site_id": f"site{site_id:02d}",
            "timestamp": now,
            "pv_kw": config["pv_kw"],
            "load_kw": config["load_kw"],
            "net_grid_kw": round(-net_kw, 2),
            "voltage_v": round(voltage_v, 2),
            "current_a": round(abs(net_kw) / (voltage_v * 1.732), 2),
            "battery_soc_percent": 68 if config["battery"] else None,
            "status": "online",
        })
    return measurements


if __name__ == "__main__":
    print(json.dumps(simulate_sites(), indent=2))
