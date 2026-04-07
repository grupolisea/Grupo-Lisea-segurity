from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Registrar fuentes
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Crear documento
doc = SimpleDocTemplate(
    "/home/z/my-project/cotizacion_lisea.pdf",
    pagesize=letter,
    topMargin=0.8*inch,
    bottomMargin=0.6*inch,
    leftMargin=0.7*inch,
    rightMargin=0.7*inch,
    title="Cotizacion Sistema de Seguridad - Grupo Lisea",
    author="Z.ai",
    creator="Z.ai",
    subject="Cotizacion de Sistema de Acceso Seguro para Seguridad Privada"
)

story = []
styles = getSampleStyleSheet()

# Estilos personalizados
title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Times New Roman',
    fontSize=22,
    leading=26,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#1a1a2e'),
    spaceAfter=6
)

subtitle_style = ParagraphStyle(
    name='SubtitleStyle',
    fontName='Times New Roman',
    fontSize=12,
    leading=16,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#d4a520'),
    spaceAfter=20
)

heading_style = ParagraphStyle(
    name='HeadingStyle',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#1a1a2e'),
    spaceBefore=12,
    spaceAfter=8
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_JUSTIFY,
    textColor=colors.HexColor('#333333'),
    spaceAfter=8
)

cell_style = ParagraphStyle(
    name='CellStyle',
    fontName='Times New Roman',
    fontSize=9,
    leading=12,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#333333')
)

cell_left_style = ParagraphStyle(
    name='CellLeftStyle',
    fontName='Times New Roman',
    fontSize=9,
    leading=12,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#333333')
)

header_style = ParagraphStyle(
    name='HeaderStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=12,
    alignment=TA_CENTER,
    textColor=colors.white
)

highlight_style = ParagraphStyle(
    name='HighlightStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=15,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#1a1a2e'),
    backColor=colors.HexColor('#f5f5dc'),
    spaceBefore=10,
    spaceAfter=10
)

# === PÁGINA 1 ===
# Logo
try:
    logo = Image('/home/z/my-project/public/escudo.jpg', width=1.2*inch, height=1.2*inch)
    logo.hAlign = 'CENTER'
    story.append(logo)
except:
    pass

story.append(Spacer(1, 10))
story.append(Paragraph("<b>GRUPO LISEA</b>", title_style))
story.append(Paragraph("Seguridad Privada Profesional", subtitle_style))
story.append(Spacer(1, 10))

# Introducción
story.append(Paragraph("<b>INFORME DE PRECIOS DEL MERCADO MEXICANO</b>", heading_style))
story.append(Paragraph(
    "El desarrollo de aplicaciones móviles en México presenta una amplia variación de precios según la complejidad "
    "del proyecto. Las aplicaciones de seguridad privada con control de dispositivos, autenticación avanzada y "
    "funcionalidades en tiempo real se encuentran en el segmento de media a alta complejidad.",
    body_style
))

# Tabla de precios del mercado
story.append(Spacer(1, 10))
story.append(Paragraph("<b>Precios de Desarrollo de Apps en México 2025-2026</b>", heading_style))

market_data = [
    [Paragraph('<b>Tipo de Aplicación</b>', header_style), Paragraph('<b>Rango de Precio</b>', header_style), Paragraph('<b>Tiempo</b>', header_style)],
    [Paragraph('App básica/simple', cell_left_style), Paragraph('$50,000 - $150,000 MXN', cell_style), Paragraph('1-2 meses', cell_style)],
    [Paragraph('App media complejidad', cell_left_style), Paragraph('$150,000 - $500,000 MXN', cell_style), Paragraph('2-4 meses', cell_style)],
    [Paragraph('App empresarial compleja', cell_left_style), Paragraph('$500,000 - $2,000,000 MXN', cell_style), Paragraph('4-8 meses', cell_style)],
    [Paragraph('PWA con autenticación', cell_left_style), Paragraph('$200,000 - $400,000 MXN', cell_style), Paragraph('2-3 meses', cell_style)],
]

market_table = Table(market_data, colWidths=[2.5*inch, 2.2*inch, 1.5*inch])
market_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#f8f8f8')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#f8f8f8')),
]))
story.append(market_table)

# Competidores
story.append(Spacer(1, 15))
story.append(Paragraph("<b>Competidores en Software de Seguridad Privada</b>", heading_style))

competitor_data = [
    [Paragraph('<b>Plataforma</b>', header_style), Paragraph('<b>Precio Mensual</b>', header_style), Paragraph('<b>Características</b>', header_style)],
    [Paragraph('Secusoft', cell_left_style), Paragraph('$34 - $159 USD/mes', cell_style), Paragraph('Registro guardias, reportes', cell_style)],
    [Paragraph('CityTroops', cell_left_style), Paragraph('Suscripción anual', cell_style), Paragraph('GPS, rondines, incidentes', cell_style)],
    [Paragraph('Evidence', cell_left_style), Paragraph('Consultar', cell_style), Paragraph('Monitoreo, supervisión', cell_style)],
    [Paragraph('Ebox Security', cell_left_style), Paragraph('Suscripción', cell_style), Paragraph('Control GPS, bitácora', cell_style)],
]

competitor_table = Table(competitor_data, colWidths=[1.8*inch, 1.8*inch, 2.6*inch])
competitor_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#d4a520')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#f8f8f8')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#f8f8f8')),
]))
story.append(competitor_table)

# Características de nuestra solución
story.append(Spacer(1, 15))
story.append(Paragraph("<b>Nuestra Solución: Sistema de Acceso Seguro</b>", heading_style))

features_data = [
    [Paragraph('<b>Característica</b>', header_style), Paragraph('<b>Valor Agregado</b>', header_style)],
    [Paragraph('PWA obligatoria (enlace oculto)', cell_left_style), Paragraph('$30,000 MXN', cell_style)],
    [Paragraph('Control 3 dispositivos por usuario', cell_left_style), Paragraph('$40,000 MXN', cell_style)],
    [Paragraph('Bloqueo automático de desktop', cell_left_style), Paragraph('$15,000 MXN', cell_style)],
    [Paragraph('Cifrado profesional AES-256', cell_left_style), Paragraph('$25,000 MXN', cell_style)],
    [Paragraph('Panel de administración completo', cell_left_style), Paragraph('$35,000 MXN', cell_style)],
    [Paragraph('Notificaciones push + sonido', cell_left_style), Paragraph('$20,000 MXN', cell_style)],
    [Paragraph('Soporte hasta 60,000 dispositivos', cell_left_style), Paragraph('$30,000 MXN', cell_style)],
    [Paragraph('API backend + base de datos', cell_left_style), Paragraph('$40,000 MXN', cell_style)],
]

features_table = Table(features_data, colWidths=[3.5*inch, 2.5*inch])
features_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#f8f8f8')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#f8f8f8')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#f8f8f8')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#f8f8f8')),
]))
story.append(features_table)

story.append(Spacer(1, 10))
story.append(Paragraph(
    "<b>Valor estimado de desarrollo: $250,000 - $350,000 MXN</b>",
    highlight_style
))

# === PÁGINA 2 ===
story.append(PageBreak())

# Logo pequeño
try:
    logo_small = Image('/home/z/my-project/public/escudo.jpg', width=0.8*inch, height=0.8*inch)
    logo_small.hAlign = 'CENTER'
    story.append(logo_small)
except:
    pass

story.append(Spacer(1, 8))
story.append(Paragraph("<b>PROPUESTA DE PAGOS PREFERENCIALES</b>", title_style))
story.append(Paragraph("Planes exclusivos para clientes Grupo Lisea", subtitle_style))

story.append(Paragraph(
    "Como parte de nuestro compromiso con la seguridad privada profesional, ofrecemos opciones de pago "
    "flexibles diseñadas para adaptarse a las necesidades de cada cliente.",
    body_style
))

story.append(Spacer(1, 15))

# Tabla de planes de pago
plan_header_style = ParagraphStyle(
    name='PlanHeaderStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.white
)

plan_data = [
    [Paragraph('<b>PLAN DE PAGO</b>', plan_header_style), Paragraph('<b>MONTO MENSUAL</b>', plan_header_style), Paragraph('<b>TOTAL</b>', plan_header_style), Paragraph('<b>AHORRO</b>', plan_header_style)],
    [Paragraph('<b>Pago Único</b><br/>(Una exhibición)', cell_style), Paragraph('—', cell_style), Paragraph('<b>$6,000 MXN</b>', cell_style), Paragraph('<b>75%</b>', cell_style)],
    [Paragraph('<b>Plan 4 Meses</b><br/>($3,000 mensuales)', cell_style), Paragraph('$3,000 MXN', cell_style), Paragraph('<b>$12,000 MXN</b>', cell_style), Paragraph('<b>50%</b>', cell_style)],
    [Paragraph('<b>Plan 12 Meses</b><br/>($2,000 mensuales)', cell_style), Paragraph('$2,000 MXN', cell_style), Paragraph('<b>$24,000 MXN</b>', cell_style), Paragraph('<b>Estándar</b>', cell_style)],
]

plan_table = Table(plan_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.2*inch])
plan_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ('TOPPADDING', (0, 0), (-1, -1), 12),
    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d4a520')),
    ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#e8f5e9')),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#fff8e1')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#fce4ec')),
]))
story.append(plan_table)

# Detalles de cada plan
story.append(Spacer(1, 20))

details_style = ParagraphStyle(
    name='DetailsStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#333333'),
    leftIndent=20,
    bulletIndent=10,
    spaceAfter=4
)

story.append(Paragraph("<b>Detalles de los Planes:</b>", heading_style))

story.append(Paragraph("• <b>Pago Único ($6,000 MXN)</b> — Pago en una sola exhibición. Máximo ahorro del 75%.", details_style))
story.append(Paragraph("• <b>Plan 4 Meses ($12,000 MXN)</b> — 4 pagos mensuales de $3,000. Ahorro del 50%.", details_style))
story.append(Paragraph("• <b>Plan 12 Meses ($24,000 MXN)</b> — 12 pagos mensuales de $2,000. Precio estándar.", details_style))

# Lo que incluye
story.append(Spacer(1, 15))
story.append(Paragraph("<b>El pago incluye:</b>", heading_style))

include_style = ParagraphStyle(
    name='IncludeStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=13,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#333333'),
    leftIndent=20,
    bulletIndent=10,
    spaceAfter=3
)

story.append(Paragraph("✓ Licencia perpetua del sistema de acceso seguro", include_style))
story.append(Paragraph("✓ Panel de administración de dispositivos", include_style))
story.append(Paragraph("✓ Soporte técnico por 12 meses", include_style))
story.append(Paragraph("✓ Actualizaciones de seguridad incluidas", include_style))
story.append(Paragraph("✓ Capacidad hasta 60,000 dispositivos", include_style))
story.append(Paragraph("✓ Notificaciones push en tiempo real", include_style))
story.append(Paragraph("✓ Cifrado profesional de datos", include_style))

# Contacto
story.append(Spacer(1, 25))

contact_box_style = ParagraphStyle(
    name='ContactBoxStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=15,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#1a1a2e')
)

contact_data = [[Paragraph(
    "<b>Para contratar este servicio o solicitar más información:</b><br/><br/>"
    "Grupo Lisea — Seguridad Privada Profesional<br/>"
    "© 2026",
    contact_box_style
)]]

contact_table = Table(contact_data, colWidths=[5.5*inch])
contact_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f5dc')),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ('TOPPADDING', (0, 0), (-1, -1), 15),
    ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#d4a520')),
]))
story.append(contact_table)

# Construir PDF
doc.build(story)
print("PDF generado exitosamente: cotizacion_lisea.pdf")
