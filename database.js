import { execSync } from 'child_process';

export function query(sql) {
  try {
    const command = `psql -U postgres -d osm_mexico -c "${sql}" -t -A`;
    const result = execSync(command, { encoding: 'utf-8' });
    return result.trim().split('\n').map(line => line.trim());
  } catch (error) {
    console.error('Error en la consulta:', error.message);
    return [];
  }
} 