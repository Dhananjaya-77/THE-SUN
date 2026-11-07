"""Five-site, low-voltage radial feeder model for the central solar platform.

Values are illustrative and are intended only for educational simulation.
"""
from dataclasses import dataclass
import pandapower as pp


@dataclass(frozen=True)
class SiteOperatingPoint:
    pv_kw: float
    load_kw: float
    battery_kw: float = 0.0


def build_feeder() -> pp.pandapowerNet:
    net = pp.create_empty_network(sn_mva=1.0)
    bus_grid = pp.create_bus(net, vn_kv=20.0, name="Grid connection")
    bus_lv = pp.create_bus(net, vn_kv=0.4, name="Feeder bus")
    pp.create_ext_grid(net, bus_grid, vm_pu=1.0, name="Utility grid")
    pp.create_transformer_from_parameters(net, bus_grid, bus_lv, sn_mva=0.25,
        vn_hv_kv=20.0, vn_lv_kv=0.4, vk_percent=6.0, vkr_percent=1.0,
        pfe_kw=0.4, i0_percent=0.2, name="0.25 MVA transformer")

    previous = bus_lv
    for index in range(1, 6):
        bus = pp.create_bus(net, vn_kv=0.4, name=f"Site {index:02d} bus")
        pp.create_line_from_parameters(net, from_bus=previous, to_bus=bus, length_km=0.05,
            r_ohm_per_km=0.642, x_ohm_per_km=0.083, c_nf_per_km=10.0,
            max_i_ka=0.16, name=f"Feeder section {index}")
        previous = bus
    return net


def run_power_flow(points: dict[int, SiteOperatingPoint]) -> dict:
    net = build_feeder()
    site_buses = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6}

    for site_number in range(1, 6):
        point = points[site_number]
        bus = site_buses[site_number]
        pp.create_load(net, bus=bus, p_mw=point.load_kw / 1000.0, q_mvar=0.05 * point.load_kw / 1000.0,
                       name=f"Site {site_number:02d} load")
        pp.create_sgen(net, bus=bus, p_mw=point.pv_kw / 1000.0, q_mvar=0.0,
                       name=f"Site {site_number:02d} PV")

    pp.runpp(net, numba=False)
    voltages = {site: float(net.res_bus.vm_pu[bus] * 400.0)
                for site, bus in site_buses.items()}
    violations = {site: voltage for site, voltage in voltages.items() if voltage > 440.0 or voltage < 360.0}
    return {
        "converged": bool(net.converged),
        "voltages_v": voltages,
        "voltage_violations_v": violations,
        "line_loading_percent": net.res_line.loading_percent.to_dict(),
        "net_import_kw": float(net.res_ext_grid.p_mw.iloc[0] * 1000.0),
    }


if __name__ == "__main__":
    scenario = {
        n: SiteOperatingPoint(pv_kw=55 + n * 2, load_kw=20 + n * 1.5)
        for n in range(1, 6)
    }
    print(run_power_flow(scenario))
