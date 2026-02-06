export interface Table {
  name: string;
  columns: {
    name: string;
    type: string;
    constraints: string;
  }[];
}

export function parseSchema(schema: string): Table[] {
  const tables: Table[] = [];

  // Split by CREATE TABLE statements
  const tableRegex = /CREATE TABLE (\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(schema)) !== null) {
    const tableName = match[1];
    const columnsDef = match[2];

    const columns: { name: string; type: string; constraints: string }[] = [];

    // Split columns by comma (but not commas within FOREIGN KEY)
    const lines = columnsDef
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    for (const line of lines) {
      // Skip FOREIGN KEY lines
      if (line.startsWith("FOREIGN KEY")) continue;

      // Remove trailing comma
      const cleanLine = line.replace(/,$/, "").trim();

      // Parse column definition: name type [constraints]
      const parts = cleanLine.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0];
        const type = parts[1];
        const constraints = parts.slice(2).join(" ");

        columns.push({ name, type, constraints });
      }
    }

    tables.push({ name: tableName, columns });
  }

  return tables;
}
