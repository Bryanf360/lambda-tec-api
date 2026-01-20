import { Request, Response } from 'express';

import PDFDocument from 'pdfkit';
import path from 'path';

import { CustomError } from '../utils';
import { ReportService } from '../services';
import { PaginationDto } from '../dtos';
import { prisma } from '../prisma/client';

export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    public getInstances = async (req: Request, res: Response): Promise<any> => {
        const { page = 1, limit = 1000, dateFrom, dateTo } = req.query;
        const sDateFrom = typeof dateFrom === 'string' ? dateFrom : undefined;
        const sDateTo = typeof dateTo === 'string' ? dateTo : undefined;
        const [error, paginationDto] = PaginationDto.create(+page, +limit, sDateFrom, sDateTo);
        if (error)
            return res.status(400).json({
                success: false,
                message: error,
                error: 'ValidationError',
            });
        this.reportService
            .getInstances(paginationDto!)
            .then((result) =>
                res.status(200).json({
                    success: true,
                    ...result,
                })
            )
            .catch((error) => this.handleError(error, res));
    };

    public exportProductInstancesPdf = async (req: Request, res: Response) => {
        try {
            const { dateFrom, dateTo } = req.query as {
                dateFrom?: string;
                dateTo?: string;
            };
            // --------------------
            // 1. Traer data real (sin filtros por ahora)
            // --------------------
            const parseLocalDate = (dateStr: string) => {
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day); // LOCAL time
            };

            const formatDate = (date: Date) => {
                return date.toLocaleDateString('es-EC', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
            };

            const where: any = {};

            if (dateFrom || dateTo) {
                where.created_at = {};

                if (dateFrom) {
                    where.created_at.gte = parseLocalDate(dateFrom);
                }

                if (dateTo) {
                    const end = parseLocalDate(dateTo);
                    end.setHours(23, 59, 59, 999); // fin del día
                    where.created_at.lte = end;
                }
            }

            const instances = await prisma.product_instances.findMany({
                where,
                include: {
                    products: {
                        include: {
                            brand: true,
                            model: true,
                            part_number: true,
                            unit_type: true,
                        },
                    },
                    warehouses: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            });

            // --------------------
            // 2. Headers de descarga
            // --------------------
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="producto-en-bodega.pdf"');

            // --------------------
            // 3. Crear PDF
            // --------------------
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 40,
            });

            doc.pipe(res);

            // --------------------
            // 4. Encabezado del documento
            // --------------------
            // --------------------
            // Encabezado con logo
            // --------------------
            const logoPath = path.join(__dirname, '../assets/logo.png');

            // Logo a la izquierda
            doc.image(logoPath, doc.x, doc.y, {
                width: 80,
            });

            // Título centrado
            doc.fontSize(18)
                .text('Reporte de Productos en Bodega', {
                    align: 'center',
                })
                .moveDown(0.5);

            doc.fontSize(10)
                .text(`Generado: ${new Date().toLocaleString()}`, { align: 'right' })
                .moveDown();

            if (dateFrom || dateTo) {
                let rangeText = 'Rango: ';

                if (dateFrom) {
                    rangeText += formatDate(parseLocalDate(dateFrom));
                } else {
                    rangeText += 'Inicio';
                }

                rangeText += ' - ';

                if (dateTo) {
                    rangeText += formatDate(parseLocalDate(dateTo));
                } else {
                    rangeText += 'Hoy';
                }

                doc.fontSize(9)
                    .text(rangeText, {
                        align: 'center',
                    })
                    .moveDown(0.5);
            }

            // --------------------
            // 5. Configuración de tabla
            // --------------------
            const startX = doc.x;
            let y = doc.y;

            const headerBg = '#2e2e2e';
            const headerText = '#ffffff';
            const borderColor = '#000000';

            const columns = [
                { label: 'Tipo', width: 45 },
                { label: 'Nombre', width: 90 },
                { label: 'Descripción', width: 130 },
                { label: 'Marca', width: 60 },
                { label: 'Modelo', width: 60 },
                { label: 'Serie', width: 80 },
                { label: 'Activo', width: 80 },
                { label: 'Bodega', width: 80 },
                { label: 'Estado', width: 70 },
                { label: 'Fecha', width: 67 },
            ];

            const tableWidth = columns.reduce((s, c) => s + c.width, 0);

            // --------------------
            // 6. Helpers
            // --------------------
            const getCellHeight = (text: string, width: number) => {
                return (
                    doc.heightOfString(text || '', {
                        width: width - 8,
                        align: 'left',
                    }) + 8
                );
            };

            const drawRow = (row: string[], isHeader = false) => {
                let x = startX;
                const yStart = y;

                const bgColor = isHeader ? headerBg : null;
                const textColor = isHeader ? headerText : '#000000';

                doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);

                // Altura dinámica por fila
                const heights = row.map((cell, i) => getCellHeight(cell, columns[i].width));
                const rowHeight = Math.max(...heights);

                // Dibujar celdas
                row.forEach((cell, i) => {
                    const colWidth = columns[i].width;

                    // Fondo (solo header)
                    if (bgColor) {
                        doc.rect(x, yStart, colWidth, rowHeight).fill(bgColor);
                    }

                    // Medir altura real del texto
                    const textHeight = doc.heightOfString(cell || '', {
                        width: colWidth - 8,
                        align: 'left',
                    });

                    // Centrado vertical
                    const textY = yStart + (rowHeight - textHeight) / 2;

                    // Texto con wrap
                    doc.fillColor(textColor).text(cell || '', x + 4, textY, {
                        width: colWidth - 8,
                        align: 'left',
                    });

                    // Borde vertical
                    doc.strokeColor(borderColor)
                        .moveTo(x, yStart)
                        .lineTo(x, yStart + rowHeight)
                        .stroke();

                    x += colWidth;
                });

                // Borde derecho final
                doc.moveTo(x, yStart)
                    .lineTo(x, yStart + rowHeight)
                    .stroke();

                // Borde inferior
                doc.moveTo(startX, yStart + rowHeight)
                    .lineTo(x, yStart + rowHeight)
                    .stroke();

                y += rowHeight;

                // Reset color
                doc.fillColor('#000000');

                // Nueva página + repetir header
                if (y > doc.page.height - 40) {
                    doc.addPage();
                    y = doc.y;

                    // Línea superior de la tabla
                    doc.strokeColor(borderColor)
                        .moveTo(startX, y)
                        .lineTo(startX + tableWidth, y)
                        .stroke();

                    // Header de nuevo
                    drawRow(
                        columns.map((c) => c.label),
                        true
                    );
                }
            };

            // --------------------
            // 7. Header de tabla
            // --------------------
            doc.strokeColor(borderColor)
                .moveTo(startX, y)
                .lineTo(startX + tableWidth, y)
                .stroke();

            drawRow(
                columns.map((c) => c.label),
                true
            );

            // --------------------
            // Sin registros (fila a ancho completo)
            // --------------------
            if (!instances.length) {
                const message = 'No se encontraron registros para los filtros seleccionados';
                const rowHeight = 24;

                // Borde superior del mensaje
                doc.strokeColor(borderColor)
                    .moveTo(startX, y)
                    .lineTo(startX + tableWidth, y)
                    .stroke();

                // Fondo gris claro (opcional, se ve pro)
                doc.rect(startX, y, tableWidth, rowHeight).fill('#f5f5f5');

                // Texto centrado horizontal y vertical
                doc.fillColor('#000000')
                    .fontSize(10)
                    .text(message, startX, y + rowHeight / 2 - 6, {
                        width: tableWidth,
                        align: 'center',
                    });

                // Borde inferior del mensaje
                doc.strokeColor(borderColor)
                    .moveTo(startX, y + rowHeight)
                    .lineTo(startX + tableWidth, y + rowHeight)
                    .stroke();

                doc.end();
                return;
            }

            // --------------------
            // 8. Filas reales
            // --------------------
            instances.forEach((i) => {
                drawRow([
                    i.products.type === 'equipment' ? 'Equipo' : 'Consumible',
                    i.products.name || '',
                    i.products.description || '',
                    i.products.brand?.name || '',
                    i.products.model?.name || '',
                    i.serial_number || '',
                    i.asset_number || '',
                    i.warehouses?.name || 'N/A',
                    i.operational_status === 'available' ? 'Disponible' : 'Despachado',
                    i.created_at.toISOString().split('T')[0],
                ]);
            });

            // --------------------
            // 9. Finalizar PDF
            // --------------------
            doc.end();
        } catch (error) {
            console.error('[EXPORT PRODUCT INSTANCES PDF]', error);
            res.status(500).json({
                message: 'Error generating PDF',
            });
        }
    };

    public getInputMovementsReport = async (req: Request, res: Response) => {
        try {
            // --------------------
            // 1. Query params
            // --------------------
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const dateFrom =
                typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;

            const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
            // --------------------
            // 2. Where dinámico
            // --------------------
            const where: any = {
                type: 'input',
            };

            if (dateFrom || dateTo) {
                where.created_at = {};

                if (dateFrom) {
                    where.created_at.gte = this.parseLocalDate(dateFrom);
                }

                if (dateTo) {
                    const end = this.parseLocalDate(dateTo);
                    end.setHours(23, 59, 59, 999);
                    where.created_at.lte = end;
                }
            }

            // --------------------
            // 3. Traer movimientos con detalles
            // --------------------
            const movements = await prisma.movements.findMany({
                where,
                include: {
                    reasons: true,
                    companies: true,
                    movement_details: {
                        include: {
                            warehouses: true,
                            products: {
                                include: {
                                    brand: true,
                                    model: true,
                                    part_number: true,
                                    unit_type: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            });

            // --------------------
            // 4. Aplanar filas
            // --------------------
            const rows = movements.flatMap((m) =>
                m.movement_details.map((d) => ({
                    movementId: m.movement_id,
                    date: m.date,
                    reason: m.reasons?.name || '-',
                    product: d.products?.name || '',
                    brand: d.products?.brand?.name || '',
                    model: d.products?.model?.name || '',
                    partNumber: d.products?.part_number.name || '',
                    quantity: d.quantity,
                    code: `MOV-${String(m.movement_id).padStart(5, '0')}`,
                    // warehouse: d.warehouses?.name || '-',
                    supplier: `${m.companies?.names} ${m.companies?.lastnames}` || '-',
                }))
            );

            // --------------------
            // 5. Paginación sobre filas planas
            // --------------------
            const total = rows.length;
            const start = (page - 1) * limit;
            const end = start + limit;

            const paginatedRows = rows.slice(start, end);

            // --------------------
            // 6. Meta
            // --------------------
            const baseUrl = `/api/v1/reports/inputs`;

            res.json({
                meta: {
                    page,
                    limit,
                    total,
                    prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
                    next: end < total ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
                },
                data: paginatedRows,
            });
        } catch (error) {
            console.error('[GET INPUT MOVEMENTS REPORT]', error);
            res.status(500).json({
                message: 'Error fetching input movements report',
            });
        }
    };

    public exportInputProductsPdf = async (req: Request, res: Response) => {
        try {
            // --------------------
            // 1. Query params
            // --------------------
            const dateFrom = this.normalizeQueryParam(req.query.dateFrom);
            const dateTo = this.normalizeQueryParam(req.query.dateTo);

            // --------------------
            // 2. Where dinámico
            // --------------------
            const where: any = {
                type: 'input',
            };

            if (dateFrom || dateTo) {
                where.date = {};

                if (dateFrom) {
                    where.date.gte = this.parseLocalDate(dateFrom);
                }

                if (dateTo) {
                    const end = this.parseLocalDate(dateTo);
                    end.setHours(23, 59, 59, 999);
                    where.date.lte = end;
                }
            }

            // --------------------
            // 3. Traer data real
            // --------------------
            const movements = await prisma.movements.findMany({
                where,
                include: {
                    reasons: true,
                    companies: true,
                    movement_details: {
                        include: {
                            products: {
                                include: {
                                    brand: true,
                                    model: true,
                                    part_number: true,
                                    unit_type: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            });

            // --------------------
            // 4. Headers PDF
            // --------------------
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="historial-ingresos-productos.pdf"'
            );

            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 40,
            });

            doc.pipe(res);

            // --------------------
            // 5. Encabezado
            // --------------------
            const startX = doc.x;
            let y = doc.y;

            const logoPath = path.join(__dirname, '../assets/logo.png');

            try {
                doc.image(logoPath, startX, y, { width: 70 });
            } catch {
                // Si falla el logo, no rompemos el PDF
            }

            doc.fontSize(18)
                .text('Historial de Ingresos de Productos', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(10)
                .text(`Generado: ${new Date().toLocaleString()}`, { align: 'right' })
                .moveDown();

            // Rango visible
            let rangeText = 'Rango: ';
            if (dateFrom) {
                rangeText += this.formatDate(this.parseLocalDate(dateFrom));
            } else {
                rangeText += 'Inicio';
            }

            rangeText += ' - ';

            if (dateTo) {
                rangeText += this.formatDate(this.parseLocalDate(dateTo));
            } else {
                rangeText += 'Hoy';
            }

            doc.fontSize(9).text(rangeText, { align: 'center' }).moveDown();

            // Fuerza posición real para empezar la tabla
            y = doc.y - 5;
            doc.x = startX;

            // --------------------
            // 6. Aplanar filas
            // --------------------
            const rows = movements.flatMap((m) =>
                m.movement_details.map((d) => ({
                    date: this.formatDate(m.date),
                    product: d.products?.name || '',
                    brand: d.products?.brand?.name || '',
                    model: d.products?.model?.name || '',
                    partNumber: d.products?.part_number?.name || '',
                    quantity: String(d.quantity),
                    movement: `MOV-${String(m.movement_id).padStart(5, '0')}`,
                    reason: m.reasons?.name || '-',
                    supplier: `${m.companies?.names} ${m.companies?.lastnames}` || '-',
                }))
            );

            // --------------------
            // 7. Config tabla (anchos base → anchos reales)
            // --------------------
            const headerBg = '#2e2e2e';
            const headerText = '#ffffff';
            const borderColor = '#000000';

            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            const baseColumns = [
                { label: 'Movimiento', baseWidth: 120 },
                { label: 'Fecha', baseWidth: 70 },
                { label: 'Producto', baseWidth: 220 },
                { label: 'Marca', baseWidth: 100 },
                { label: 'Modelo', baseWidth: 100 },
                { label: 'Número de Parte', baseWidth: 100 },
                { label: 'Cantidad', baseWidth: 70 },
                { label: 'Motivo', baseWidth: 160 },
                { label: 'Proveedor', baseWidth: 160 },
            ];

            const totalBase = baseColumns.reduce((s, c) => s + c.baseWidth, 0);
            const scale = pageWidth / totalBase;

            const columns: any[] = baseColumns.map((c) => ({
                ...c,
                width: c.baseWidth * scale,
            }));

            const tableWidth = pageWidth;

            // --------------------
            // 8. Helpers tabla
            // --------------------
            const getCellHeight = (text: string, width: number) => {
                return (
                    doc.heightOfString(text || '', {
                        width: width - 8,
                        align: 'left',
                    }) + 8
                );
            };

            const drawRow = (row: string[], isHeader = false) => {
                let x = startX;
                const yStart = y;

                const bgColor = isHeader ? headerBg : null;
                const textColor = isHeader ? headerText : '#000000';

                doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);

                const heights = row.map((cell, i) => getCellHeight(cell, columns[i].width));
                const rowHeight = Math.max(...heights);

                row.forEach((cell, i) => {
                    const colWidth = columns[i].width;

                    // Fondo header
                    if (bgColor) {
                        doc.rect(x, yStart, colWidth, rowHeight).fill(bgColor);
                    }

                    const textHeight = doc.heightOfString(cell || '', {
                        width: colWidth - 8,
                    });

                    const textY = yStart + (rowHeight - textHeight) / 2;

                    // Texto con wrap
                    doc.fillColor(textColor).text(cell || '', x + 4, textY, {
                        width: colWidth - 8,
                        align: 'left',
                    });

                    // Borde vertical
                    doc.strokeColor(borderColor)
                        .moveTo(x, yStart)
                        .lineTo(x, yStart + rowHeight)
                        .stroke();

                    x += colWidth;
                });

                // Borde derecho
                doc.moveTo(x, yStart)
                    .lineTo(x, yStart + rowHeight)
                    .stroke();

                // Borde inferior
                doc.moveTo(startX, yStart + rowHeight)
                    .lineTo(x, yStart + rowHeight)
                    .stroke();

                y += rowHeight;
                doc.fillColor('#000000');

                // Nueva página
                if (y > doc.page.height - 40) {
                    doc.addPage();
                    y = doc.y;
                    doc.x = startX;

                    doc.strokeColor(borderColor)
                        .moveTo(startX, y)
                        .lineTo(startX + tableWidth, y)
                        .stroke();

                    drawRow(
                        columns.map((c) => c.label),
                        true
                    );
                }
            };

            // --------------------
            // 9. Header tabla
            // --------------------
            doc.strokeColor(borderColor)
                .moveTo(startX, y)
                .lineTo(startX + tableWidth, y)
                .stroke();

            drawRow(
                columns.map((c) => c.label),
                true
            );

            // --------------------
            // 10. Sin registros
            // --------------------
            if (!rows.length) {
                const message =
                    'No se encontraron productos ingresados para los filtros seleccionados';
                const rowHeight = 24;

                doc.rect(startX, y, tableWidth, rowHeight).fill('#f5f5f5');

                doc.fillColor('#000000')
                    .fontSize(10)
                    .text(message, startX, y + rowHeight / 2 - 6, {
                        width: tableWidth,
                        align: 'center',
                    });

                doc.strokeColor(borderColor)
                    .moveTo(startX, y + rowHeight)
                    .lineTo(startX + tableWidth, y + rowHeight)
                    .stroke();

                doc.end();
                return;
            }

            // --------------------
            // 11. Filas reales
            // --------------------
            rows.forEach((r) => {
                drawRow([
                    r.movement,
                    r.date,
                    r.product,
                    r.brand,
                    r.model,
                    r.partNumber,
                    r.quantity,
                    r.reason,
                    r.supplier,
                ]);
            });

            // --------------------
            // 12. Finalizar PDF
            // --------------------
            doc.end();
        } catch (error) {
            console.error('[EXPORT INPUT PRODUCTS PDF]', error);
            res.status(500).json({
                message: 'Error generating input products PDF',
            });
        }
    };

    public getOutputMovementsReport = async (req: Request, res: Response) => {
        try {
            // --------------------
            // 1. Query params
            // --------------------
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const dateFrom =
                typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;

            const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
            // --------------------
            // 2. Where dinámico
            // --------------------
            const where: any = {
                type: 'output',
            };

            if (dateFrom || dateTo) {
                where.created_at = {};

                if (dateFrom) {
                    where.created_at.gte = this.parseLocalDate(dateFrom);
                }

                if (dateTo) {
                    const end = this.parseLocalDate(dateTo);
                    end.setHours(23, 59, 59, 999);
                    where.created_at.lte = end;
                }
            }

            // --------------------
            // 3. Traer movimientos con detalles
            // --------------------
            const movements = await prisma.movements.findMany({
                where,
                include: {
                    reasons: true,
                    companies: true,
                    movement_details: {
                        include: {
                            warehouses: true,
                            products: {
                                include: {
                                    brand: true,
                                    model: true,
                                    part_number: true,
                                    unit_type: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            });

            // --------------------
            // 4. Aplanar filas
            // --------------------
            const rows = movements.flatMap((m) =>
                m.movement_details.map((d) => ({
                    movementId: m.movement_id,
                    date: m.date,
                    reason: m.reasons?.name || '-',
                    product: d.products?.name || '',
                    brand: d.products?.brand?.name || '',
                    model: d.products?.model?.name || '',
                    partNumber: d.products?.part_number.name || '',
                    quantity: d.quantity,
                    code: `MOV-${String(m.movement_id).padStart(5, '0')}`,
                    // warehouse: d.warehouses?.name || '-',
                    client: `${m.companies?.names} ${m.companies?.lastnames}` || '-',
                }))
            );

            // --------------------
            // 5. Paginación sobre filas planas
            // --------------------
            const total = rows.length;
            const start = (page - 1) * limit;
            const end = start + limit;

            const paginatedRows = rows.slice(start, end);

            // --------------------
            // 6. Meta
            // --------------------
            const baseUrl = `/api/v1/reports/inputs`;

            res.json({
                meta: {
                    page,
                    limit,
                    total,
                    prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
                    next: end < total ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
                },
                data: paginatedRows,
            });
        } catch (error) {
            console.error('[GET INPUT MOVEMENTS REPORT]', error);
            res.status(500).json({
                message: 'Error fetching input movements report',
            });
        }
    };

    public exportOutputProductsPdf = async (req: Request, res: Response) => {
        try {
            // --------------------
            // 1. Query params
            // --------------------
            const dateFrom = this.normalizeQueryParam(req.query.dateFrom);
            const dateTo = this.normalizeQueryParam(req.query.dateTo);

            // --------------------
            // 2. Where dinámico
            // --------------------
            const where: any = {
                type: 'output',
            };

            if (dateFrom || dateTo) {
                where.date = {};

                if (dateFrom) {
                    where.date.gte = this.parseLocalDate(dateFrom);
                }

                if (dateTo) {
                    const end = this.parseLocalDate(dateTo);
                    end.setHours(23, 59, 59, 999);
                    where.date.lte = end;
                }
            }

            // --------------------
            // 3. Traer data real
            // --------------------
            const movements = await prisma.movements.findMany({
                where,
                include: {
                    reasons: true,
                    companies: true,
                    movement_details: {
                        include: {
                            products: {
                                include: {
                                    brand: true,
                                    model: true,
                                    part_number: true,
                                    unit_type: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            });

            // --------------------
            // 4. Headers PDF
            // --------------------
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="historial-salidas-productos.pdf"'
            );

            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 40,
            });

            doc.pipe(res);

            // --------------------
            // 5. Encabezado
            // --------------------
            const startX = doc.x;
            let y = doc.y;

            const logoPath = path.join(__dirname, '../assets/logo.png');

            try {
                doc.image(logoPath, startX, y, { width: 70 });
            } catch {
                // Si falla el logo, no rompemos el PDF
            }

            doc.fontSize(18)
                .text('Historial de Salidas de Productos', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(10)
                .text(`Generado: ${new Date().toLocaleString()}`, { align: 'right' })
                .moveDown();

            // Rango visible
            let rangeText = 'Rango: ';
            if (dateFrom) {
                rangeText += this.formatDate(this.parseLocalDate(dateFrom));
            } else {
                rangeText += 'Inicio';
            }

            rangeText += ' - ';

            if (dateTo) {
                rangeText += this.formatDate(this.parseLocalDate(dateTo));
            } else {
                rangeText += 'Hoy';
            }

            doc.fontSize(9).text(rangeText, { align: 'center' }).moveDown();

            // Fuerza posición real para empezar la tabla
            y = doc.y - 5;
            doc.x = startX;

            // --------------------
            // 6. Aplanar filas
            // --------------------
            const rows = movements.flatMap((m) =>
                m.movement_details.map((d) => ({
                    date: this.formatDate(m.date),
                    product: d.products?.name || '',
                    brand: d.products?.brand?.name || '',
                    model: d.products?.model?.name || '',
                    partNumber: d.products?.part_number?.name || '',
                    quantity: String(d.quantity),
                    movement: `MOV-${String(m.movement_id).padStart(5, '0')}`,
                    reason: m.reasons?.name || '-',
                    client: `${m.companies?.names} ${m.companies?.lastnames}` || '-',
                }))
            );

            // --------------------
            // 7. Config tabla (anchos base → anchos reales)
            // --------------------
            const headerBg = '#2e2e2e';
            const headerText = '#ffffff';
            const borderColor = '#000000';

            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            const baseColumns = [
                { label: 'Movimiento', baseWidth: 120 },
                { label: 'Fecha', baseWidth: 70 },
                { label: 'Producto', baseWidth: 220 },
                { label: 'Marca', baseWidth: 100 },
                { label: 'Modelo', baseWidth: 100 },
                { label: 'Número de Parte', baseWidth: 100 },
                { label: 'Cantidad', baseWidth: 70 },
                { label: 'Motivo', baseWidth: 160 },
                { label: 'Cliente', baseWidth: 160 },
            ];

            const totalBase = baseColumns.reduce((s, c) => s + c.baseWidth, 0);
            const scale = pageWidth / totalBase;

            const columns: any[] = baseColumns.map((c) => ({
                ...c,
                width: c.baseWidth * scale,
            }));

            const tableWidth = pageWidth;

            // --------------------
            // 8. Helpers tabla
            // --------------------
            const getCellHeight = (text: string, width: number) => {
                return (
                    doc.heightOfString(text || '', {
                        width: width - 8,
                        align: 'left',
                    }) + 8
                );
            };

            const drawRow = (row: string[], isHeader = false) => {
                let x = startX;
                const yStart = y;

                const bgColor = isHeader ? headerBg : null;
                const textColor = isHeader ? headerText : '#000000';

                doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);

                const heights = row.map((cell, i) => getCellHeight(cell, columns[i].width));
                const rowHeight = Math.max(...heights);

                row.forEach((cell, i) => {
                    const colWidth = columns[i].width;

                    // Fondo header
                    if (bgColor) {
                        doc.rect(x, yStart, colWidth, rowHeight).fill(bgColor);
                    }

                    const textHeight = doc.heightOfString(cell || '', {
                        width: colWidth - 8,
                    });

                    const textY = yStart + (rowHeight - textHeight) / 2;

                    // Texto con wrap
                    doc.fillColor(textColor).text(cell || '', x + 4, textY, {
                        width: colWidth - 8,
                        align: 'left',
                    });

                    // Borde vertical
                    doc.strokeColor(borderColor)
                        .moveTo(x, yStart)
                        .lineTo(x, yStart + rowHeight)
                        .stroke();

                    x += colWidth;
                });

                // Borde derecho
                doc.moveTo(x, yStart)
                    .lineTo(x, yStart + rowHeight)
                    .stroke();

                // Borde inferior
                doc.moveTo(startX, yStart + rowHeight)
                    .lineTo(x, yStart + rowHeight)
                    .stroke();

                y += rowHeight;
                doc.fillColor('#000000');

                // Nueva página
                if (y > doc.page.height - 40) {
                    doc.addPage();
                    y = doc.y;
                    doc.x = startX;

                    doc.strokeColor(borderColor)
                        .moveTo(startX, y)
                        .lineTo(startX + tableWidth, y)
                        .stroke();

                    drawRow(
                        columns.map((c) => c.label),
                        true
                    );
                }
            };

            // --------------------
            // 9. Header tabla
            // --------------------
            doc.strokeColor(borderColor)
                .moveTo(startX, y)
                .lineTo(startX + tableWidth, y)
                .stroke();

            drawRow(
                columns.map((c) => c.label),
                true
            );

            // --------------------
            // 10. Sin registros
            // --------------------
            if (!rows.length) {
                const message =
                    'No se encontraron productos ingresados para los filtros seleccionados';
                const rowHeight = 24;

                doc.rect(startX, y, tableWidth, rowHeight).fill('#f5f5f5');

                doc.fillColor('#000000')
                    .fontSize(10)
                    .text(message, startX, y + rowHeight / 2 - 6, {
                        width: tableWidth,
                        align: 'center',
                    });

                doc.strokeColor(borderColor)
                    .moveTo(startX, y + rowHeight)
                    .lineTo(startX + tableWidth, y + rowHeight)
                    .stroke();

                doc.end();
                return;
            }

            // --------------------
            // 11. Filas reales
            // --------------------
            rows.forEach((r) => {
                drawRow([
                    r.movement,
                    r.date,
                    r.product,
                    r.brand,
                    r.model,
                    r.partNumber,
                    r.quantity,
                    r.reason,
                    r.client,
                ]);
            });

            // --------------------
            // 12. Finalizar PDF
            // --------------------
            doc.end();
        } catch (error) {
            console.error('[EXPORT INPUT PRODUCTS PDF]', error);
            res.status(500).json({
                message: 'Error generating input products PDF',
            });
        }
    };

    private normalizeQueryParam = (value: unknown): string | undefined => {
        if (typeof value === 'string') return value;
        return undefined;
    };

    private formatDate = (date: Date) => {
        return date.toLocaleDateString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: error.error,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError',
        });
    };

    private parseLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // LOCAL time
    };
}
