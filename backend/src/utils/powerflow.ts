import { spawn } from 'child_process';
import path from 'path';
import { config } from '../config/index.js';
import logger from './logger.js';

interface PowerFlowInput {
  [siteNumber: number]: {
    pvKw: number;
    loadKw: number;
    batteryKw?: number;
  };
}

interface PowerFlowResult {
  converged: boolean;
  voltages_v: Record<string, number>;
  voltage_violations_v: Record<string, number>;
  line_loading_percent: Record<string, number>;
  net_import_kw: number;
}

/**
 * Runs a power-flow simulation via the Python pandapower bridge.
 * Spawns a Python subprocess that executes the network model.
 */
export function runPowerFlow(inputs: PowerFlowInput): Promise<PowerFlowResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), '..', 'power-system', 'network_model.py');
    const pythonScript = `
import sys, json
sys.path.insert(0, '${path.resolve(process.cwd(), '..', 'power-system')}')
from network_model import run_power_flow, SiteOperatingPoint

inputs = json.loads('${JSON.stringify(inputs)}')
points = {}
for k, v in inputs.items():
    points[int(k)] = SiteOperatingPoint(
        pv_kw=v['pvKw'],
        load_kw=v['loadKw'],
        battery_kw=v.get('batteryKw', 0.0)
    )
result = run_power_flow(points)
print(json.dumps(result))
`;

    const pythonBinary = config.python.path.includes('/')
      ? path.resolve(process.cwd(), config.python.path)
      : config.python.path;
    const proc = spawn(pythonBinary, ['-c', pythonScript]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        logger.error('Power flow simulation failed', { code, stderr });
        reject(new Error(`Power flow failed: ${stderr}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(`Failed to parse power flow result: ${stdout}`));
      }
    });

    proc.on('error', (err) => {
      logger.error('Failed to spawn Python process', { error: err.message });
      reject(err);
    });
  });
}
