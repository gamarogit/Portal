import React, { useState, useEffect } from 'react';
import ReportEditor from '@components/ReportEditor';
import { reportBuilderService, CustomReport } from '@services/api';
import jsPDF from 'jspdf';

const ReportBuilderView: React.FC = () => {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('<p>Escribe tu reporte aquí...</p>');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportBuilderService.list();
      setReports(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      alert('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleNewReport = () => {
    setEditingReport(null);
    setTitle('');
    setDescription('');
    setContent('<p>Escribe tu reporte aquí...</p>');
    setShowEditor(true);
  };

  const handleEditReport = async (report: CustomReport) => {
    setEditingReport(report);
    setTitle(report.title);
    setDescription(report.description || '');
    setContent(report.content);
    setShowEditor(true);
  };

  const handleSaveReport = async () => {
    if (!title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        content,
      };

      if (editingReport) {
        await reportBuilderService.update(editingReport.id, payload);
        alert('Reporte actualizado');
      } else {
        await reportBuilderService.create(payload);
        alert('Reporte creado');
      }

      setShowEditor(false);
      loadReports();
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      alert('Error al guardar reporte');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('¿Eliminar este reporte?')) return;

    try {
      await reportBuilderService.delete(id);
      alert('Reporte eliminado');
      loadReports();
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      alert('Error al eliminar reporte');
    }
  };

  const exportToPDF = (report: CustomReport) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter', // Tamaño carta
    });

    // Crear contenedor temporal para renderizar HTML
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '816px'; // 8.5 pulgadas a 96 DPI
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.innerHTML = `
      <h1 style="text-align: center; margin-bottom: 20px;">${report.title}</h1>
      ${report.description ? `<p style="text-align: center; color: #666; margin-bottom: 30px;">${report.description}</p>` : ''}
      <div style="line-height: 1.6;">${report.content}</div>
      <div style="margin-top: 50px; page-break-inside: avoid;">
        <p style="color: #666; font-size: 12px;">
          Creado por: ${report.creator?.name || 'Usuario'}<br>
          Fecha: ${new Date(report.createdAt).toLocaleDateString('es-MX')}
        </p>
      </div>
    `;
    document.body.appendChild(tempDiv);

    // Título
    doc.setFontSize(18);
    doc.text(report.title, 105, 20, { align: 'center' });

    // Descripción
    if (report.description) {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(report.description, 105, 30, { align: 'center', maxWidth: 170 });
    }

    // Contenido (simplificado - HTML a texto)
    doc.setFontSize(11);
    doc.setTextColor(0);
    const textContent = tempDiv.innerText.split('\n').slice(2).join('\n'); // Saltar título y descripción
    const lines = doc.splitTextToSize(textContent, 170);
    doc.text(lines, 20, 45);

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} | Generado el ${new Date().toLocaleDateString('es-MX')}`,
        105,
        270,
        { align: 'center' }
      );
    }

    document.body.removeChild(tempDiv);
    doc.save(`${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando reportes...</div>;
  }

  if (showEditor) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{editingReport ? 'Editar Reporte' : 'Nuevo Reporte'}</h2>
          <div>
            <button
              onClick={handleSaveReport}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              💾 Guardar
            </button>
            <button
              onClick={() => setShowEditor(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del reporte"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del reporte"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <ReportEditor content={content} onChange={setContent} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Generador de Reportes</h2>
        <button
          onClick={handleNewReport}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ➕ Nuevo Reporte
        </button>
      </div>

      {reports.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#6c757d',
          }}
        >
          <p>No hay reportes creados. Crea tu primer reporte personalizado.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{report.title}</h3>
              {report.description && (
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>{report.description}</p>
              )}
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
                <div>Creado: {new Date(report.createdAt).toLocaleDateString('es-MX')}</div>
                <div>Por: {report.creator?.name || 'Usuario'}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleEditReport(report)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => exportToPDF(report)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportBuilderView;
