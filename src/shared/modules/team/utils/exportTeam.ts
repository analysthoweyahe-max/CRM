export function downloadTeamExcel(
  headers: string[],
  rows:    (string | number)[][],
  filename  = 'team-members.xls',
  sheetName = 'Team',
) {
  const cell = (v: string | number) =>
    `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${v}</Data></Cell>`;

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"`,
    `  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
    `  <Worksheet ss:Name="${sheetName}">`,
    `    <Table>`,
    `      <Row>${headers.map(h => cell(h)).join('')}</Row>`,
    ...rows.map(r => `      <Row>${r.map(v => cell(v)).join('')}</Row>`),
    `    </Table>`,
    `  </Worksheet>`,
    `</Workbook>`,
  ].join('\n');

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
