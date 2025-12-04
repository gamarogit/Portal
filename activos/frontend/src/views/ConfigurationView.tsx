import React, { useState, useEffect } from 'react';
import api from '@services/api';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
}

interface TableColumn {
  label: string;
  visible: boolean;
  order: number;
  dataType?: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  visible: boolean;
  order: number;
  parentPath?: string;
  children?: MenuItem[];
}

interface FormSchema {
  fields?: FormField[];
  columns?: TableColumn[];
  menuItems?: MenuItem[];
  layout?: string;
  type?: 'form' | 'table' | 'menu';
  title?: string;
}

const ConfigurationView: React.FC = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [schema, setSchema] = useState<FormSchema>({ fields: [], layout: 'grid-2cols', type: 'form' });
  const [originalSchema, setOriginalSchema] = useState<FormSchema>({ fields: [], layout: 'grid-2cols', type: 'form' });
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showSubitemModal, setShowSubitemModal] = useState(false);
  const [selectedParentPath, setSelectedParentPath] = useState<string>('');
  const [selectedItemsForSubitem, setSelectedItemsForSubitem] = useState<string[]>([]);

  useEffect(() => {
    loadForms();
    
    // Restaurar formulario seleccionado desde localStorage
    const savedForm = localStorage.getItem('selectedConfigForm');
    if (savedForm) {
      loadFormSchema(savedForm);
    }
  }, []);

  const loadForms = async () => {
    try {
      const res = await api.get('/configuration/forms');
      setForms(res.data.forms);
    } catch (error) {
      console.error('Error cargando formularios:', error);
    }
  };

  const loadFormSchema = async (formName: string) => {
    try {
      const res = await api.get(`/configuration/form-schema?form=${formName}`);
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('selectedConfigForm', formName);
      
      if (res.data.type === 'table') {
        setSchema({
          columns: res.data.columns || [],
          type: 'table',
          layout: 'grid-2cols',
          title: res.data.title || '',
        });
      } else if (res.data.type === 'menu') {
        const menuItems = res.data.menuItems || [];
        
        // Ordenar: primero items principales, luego sus subitems inmediatamente después
        const sortedItems: MenuItem[] = [];
        const processedPaths = new Set<string>();
        
        // Primero agregar items principales (sin parentPath)
        menuItems.forEach((item: MenuItem) => {
          if (!item.parentPath && !processedPaths.has(item.path)) {
            sortedItems.push(item);
            processedPaths.add(item.path);
            
            // Luego agregar sus hijos inmediatamente después
            menuItems.forEach((child: MenuItem) => {
              if (child.parentPath === item.path && !processedPaths.has(child.path)) {
                sortedItems.push(child);
                processedPaths.add(child.path);
              }
            });
          }
        });
        
        // Agregar cualquier item huérfano (subitems cuyo padre no existe)
        menuItems.forEach((item: MenuItem) => {
          if (!processedPaths.has(item.path)) {
            sortedItems.push(item);
            processedPaths.add(item.path);
          }
        });
        
        const menuSchema = {
          menuItems: sortedItems,
          type: 'menu' as const,
          layout: 'grid-2cols',
          title: res.data.title || '',
        };
        setSchema(menuSchema);
        setOriginalSchema(JSON.parse(JSON.stringify(menuSchema)));
      } else {
        const newSchema = {
          fields: res.data.fields || [],
          layout: res.data.layout || 'grid-2cols',
          type: 'form' as const,
          title: res.data.title || '',
        };
        setSchema(newSchema);
        setOriginalSchema(JSON.parse(JSON.stringify(newSchema)));
      }
      
      setShowEditor(true);
    } catch (error: any) {
      console.error('Error cargando esquema:', error);
      alert('Error cargando formulario: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleCancel = () => {
    // Restaurar el schema original
    setSchema(JSON.parse(JSON.stringify(originalSchema)));
    setEditingField(null);
    setSaveMessage('Cambios descartados');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSaveSchema = async () => {
    const currentFormName = localStorage.getItem('selectedConfigForm');
    
    if (!currentFormName) return;
    
    try {
      const res = await api.post('/configuration/form-schema', {
        formName: currentFormName,
        schema,
      });
      
      // Recargar el esquema desde el servidor manteniendo el formulario seleccionado
      await loadFormSchema(currentFormName);
      
      // Actualizar el schema original después de guardar exitosamente
      setOriginalSchema(JSON.parse(JSON.stringify(schema)));
      
      setSaveMessage(res.data.message || '✅ Cambios guardados exitosamente');
      
      // Si es el menú, disparar evento para recargar MainLayout
      if (schema.type === 'menu') {
        window.dispatchEvent(new CustomEvent('configurationUpdated'));
      }
      
    } catch (error: any) {
      console.error('[ConfigurationView] Error guardando:', error);
      setSaveMessage('❌ Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateField = (index: number, updates: Partial<FormField>) => {
    if (!schema.fields) return;
    const newFields = [...schema.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setSchema({ ...schema, fields: newFields });
  };

  const handleAddField = () => {
    if (!schema.fields) return;
    const newField: FormField = {
      name: `campo_${Date.now()}`,
      label: 'Nuevo Campo',
      type: 'text',
      required: false,
      order: schema.fields.length + 1,
    };
    setSchema({ ...schema, fields: [...schema.fields, newField] });
  };

  const handleDeleteField = (index: number) => {
    if (!schema.fields) return;
    const newFields = schema.fields.filter((_, i) => i !== index);
    setSchema({ ...schema, fields: newFields });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!schema.fields) return;
    const newFields = [...schema.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((field, i) => field.order = i + 1);
    
    setSchema({ ...schema, fields: newFields });
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    if (!schema.columns) return;
    const newColumns = [...schema.columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newColumns.length) return;
    
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    newColumns.forEach((col, i) => col.order = i + 1);
    
    setSchema({ ...schema, columns: newColumns });
  };

  const handleUpdateColumn = (index: number, updates: Partial<TableColumn>) => {
    if (!schema.columns) return;
    const newColumns = [...schema.columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setSchema({ ...schema, columns: newColumns });
  };

  const handleUpdateMenuItem = (index: number, updates: Partial<MenuItem>) => {
    if (!schema.menuItems) return;
    const newItems = [...schema.menuItems];
    newItems[index] = { ...newItems[index], ...updates };
    setSchema({ ...schema, menuItems: newItems });
  };

  const moveMenuItem = (index: number, direction: 'up' | 'down') => {
    if (!schema.menuItems) return;
    const newItems = [...schema.menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => item.order = i + 1);
    
    setSchema({ ...schema, menuItems: newItems });
  };

  const handleAddSubitem = (parentPath: string) => {
    console.log('=== ABRIENDO MODAL ===');
    console.log('Parent path recibido:', parentPath);
    setSelectedParentPath(parentPath);
    setSelectedItemsForSubitem([]);
    setShowSubitemModal(true);
  };

  const toggleItemSelection = (itemPath: string) => {
    setSelectedItemsForSubitem(prev => {
      if (prev.includes(itemPath)) {
        return prev.filter(p => p !== itemPath);
      } else {
        return [...prev, itemPath];
      }
    });
  };

  const handleAddSelectedSubitems = () => {
    if (!schema.menuItems || selectedItemsForSubitem.length === 0) return;
    
    console.log('=== AGREGANDO SUBITEMS ===');
    console.log('Parent path actual:', selectedParentPath);
    console.log('Items seleccionados:', selectedItemsForSubitem);
    
    // Mostrar el estado ACTUAL de los items seleccionados ANTES de actualizar
    selectedItemsForSubitem.forEach(path => {
      const currentItem = schema.menuItems?.find(i => i.path === path);
      console.log(`Estado ANTES - ${path}:`, currentItem);
    });
    
    const newItems = [...schema.menuItems].map(item => {
      if (selectedItemsForSubitem.includes(item.path)) {
        console.log(`Actualizando ${item.path} -> parentPath: ${selectedParentPath}`);
        // Crear un nuevo objeto con el parentPath actualizado
        return { 
          ...item, 
          parentPath: selectedParentPath,
        };
      }
      return item;
    });
    
    // Reordenar: primero items principales, luego sus subitems inmediatamente después
    const sortedItems: MenuItem[] = [];
    const processedPaths = new Set<string>();
    
    // Primero agregar items principales y sus hijos
    newItems.forEach((item) => {
      if (!item.parentPath && !processedPaths.has(item.path)) {
        sortedItems.push(item);
        processedPaths.add(item.path);
        
        // Agregar sus hijos inmediatamente después
        newItems.forEach((child) => {
          if (child.parentPath === item.path && !processedPaths.has(child.path)) {
            sortedItems.push(child);
            processedPaths.add(child.path);
          }
        });
      }
    });
    
    // Agregar items huérfanos (subitems cuyo padre no existe o no está en la lista)
    newItems.forEach((item) => {
      if (!processedPaths.has(item.path)) {
        sortedItems.push(item);
        processedPaths.add(item.path);
      }
    });
    
    // Reordenar el campo order
    sortedItems.forEach((item, i) => item.order = i + 1);
    
    // Mostrar el estado DESPUÉS de actualizar
    selectedItemsForSubitem.forEach(path => {
      const updatedItem = sortedItems.find(i => i.path === path);
      console.log(`Estado DESPUÉS - ${path}:`, updatedItem);
    });
    
    // Forzar actualización creando un nuevo objeto de schema
    const updatedSchema = { 
      ...schema, 
      menuItems: sortedItems 
    };
    
    setSchema(updatedSchema);
    
    // Confirmar al usuario
    alert(`✓ ${selectedItemsForSubitem.length} item(s) agregado(s) como subitems de ${selectedParentPath}.\n\nNo olvides hacer clic en "Guardar Cambios" para persistir los cambios.`);
    
    setShowSubitemModal(false);
    setSelectedParentPath('');
    setSelectedItemsForSubitem([]);
  };

  const handleSelectItemAsSubitem = (itemPath: string) => {
    if (!schema.menuItems) return;
    
    const newItems = schema.menuItems.map(item => {
      if (item.path === itemPath) {
        return { ...item, parentPath: selectedParentPath };
      }
      return item;
    });
    
    setSchema({ ...schema, menuItems: newItems });
    setShowSubitemModal(false);
    setSelectedParentPath('');
  };

  const handleRemoveSubitem = (index: number) => {
    if (!schema.menuItems) return;
    const newItems = schema.menuItems.filter((_, i) => i !== index);
    newItems.forEach((item, i) => item.order = i + 1);
    setSchema({ ...schema, menuItems: newItems });
  };

  const handleMenuDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleMenuDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMenuDropAsSubitem = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || !schema.menuItems) return;
    
    const draggedItem = schema.menuItems[draggedIndex];
    
    // No permitir que un item se convierta en subitem de sí mismo
    if (draggedItem.path === targetPath) return;
    
    // No permitir que un item sea subitem de uno de sus propios hijos
    if (targetPath.startsWith(draggedItem.path + '/')) return;
    
    const newItems = [...schema.menuItems];
    
    // Actualizar el item arrastrado - mantener la ruta original, solo cambiar el parentPath
    newItems[draggedIndex] = {
      ...draggedItem,
      parentPath: targetPath,
      // La ruta (path) se mantiene igual para que la navegación funcione
    };
    
    setSchema({ ...schema, menuItems: newItems });
    setDraggedIndex(null);
  };

  const handleMenuDropToReorder = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || !schema.menuItems || draggedIndex === dropIndex) return;
    
    const newItems = [...schema.menuItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    newItems.forEach((item, i) => item.order = i + 1);
    
    setSchema({ ...schema, menuItems: newItems });
    setDraggedIndex(null);
  };

  const handleConvertToMainItem = (index: number) => {
    if (!schema.menuItems) return;
    const newItems = [...schema.menuItems];
    const item = newItems[index];
    
    // Remover el parentPath - la ruta se mantiene igual para navegación
    newItems[index] = {
      ...item,
      parentPath: undefined,
    };
    
    setSchema({ ...schema, menuItems: newItems });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !schema.fields) return;
    
    const newFields = [...schema.fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(dropIndex, 0, draggedField);
    newFields.forEach((field, i) => field.order = i + 1);
    
    setSchema({ ...schema, fields: newFields });
    setDraggedIndex(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>⚙️ Configuración de Formularios</h2>
      
      {saveMessage && (
        <div style={{
          padding: '10px 15px',
          marginBottom: '15px',
          backgroundColor: saveMessage.includes('❌') ? '#f8d7da' : '#d4edda',
          color: saveMessage.includes('❌') ? '#721c24' : '#155724',
          border: `1px solid ${saveMessage.includes('❌') ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {saveMessage}
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Seleccionar Formulario:
        </label>
        <select
          value={localStorage.getItem('selectedConfigForm') || ''}
          onChange={(e) => {
            const formName = e.target.value;
            if (formName) {
              loadFormSchema(formName);
            }
          }}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '300px',
          }}
        >
          <option value="">-- Selecciona un formulario --</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))}
        </select>
      </div>

      {showEditor && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Editor */}
          <div>
            <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleSaveSchema}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                💾 Guardar Cambios
              </button>
              {schema.type === 'form' && (
                <button
                  onClick={handleAddField}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ➕ Agregar Campo
                </button>
              )}
              <button
                onClick={handleCancel}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ❌ Cancelar
              </button>

            </div>

            {/* Campo de Título */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '13px' }}>
                Título:
              </label>
              <input
                type="text"
                value={schema.title || ''}
                onChange={(e) => setSchema({ ...schema, title: e.target.value })}
                placeholder={
                  schema.type === 'menu' ? 'Ej: Activos TI 2025' :
                  schema.type === 'table' ? 'Ej: Listado de Activos' :
                  'Ej: Registro de Activo'
                }
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '11px' }}>
                Este título se mostrará en la parte superior del {
                  schema.type === 'menu' ? 'menú' :
                  schema.type === 'table' ? 'tabla' :
                  'formulario'
                }
              </small>
            </div>

            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>
              {schema.type === 'menu' ? 'Elementos del Menú' : 
               schema.type === 'table' ? 'Columnas de la Tabla' : 
               'Campos del Formulario'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {schema.type === 'menu' && schema.menuItems?.map((item, index) => {
                const isSubitem = !!item.parentPath;
                const isDragging = draggedIndex === index;
                return (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleMenuDragStart(index)}
                    onDragOver={handleMenuDragOver}
                    onDrop={(e) => handleMenuDropToReorder(e, index)}
                    style={{
                      border: isDragging ? '2px dashed #007bff' : '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '10px',
                      backgroundColor: isSubitem ? '#f0f8ff' : '#f9f9f9',
                      marginLeft: isSubitem ? '20px' : '0',
                      borderLeft: isSubitem ? '3px solid #007bff' : 'none',
                      opacity: isDragging ? 0.5 : 1,
                      cursor: 'move',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>
                          {isSubitem ? '└─ Etiqueta (Subitem):' : 'Etiqueta:'}
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateMenuItem(index, { label: e.target.value })}
                          style={{ width: '100%', padding: '5px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Ruta:</label>
                        <input
                          type="text"
                          value={item.path}
                          onChange={(e) => handleUpdateMenuItem(index, { path: e.target.value })}
                          style={{ 
                            width: '100%', 
                            padding: '5px', 
                            fontSize: '12px', 
                            backgroundColor: isSubitem ? '#fff' : '#e9ecef',
                            cursor: isSubitem ? 'text' : 'not-allowed',
                            color: '#495057',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                          readOnly={!isSubitem}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Icono:</label>
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => handleUpdateMenuItem(index, { icon: e.target.value })}
                          style={{ width: '100%', padding: '5px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}
                        />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Visible:</label>
                        <input
                          type="checkbox"
                          checked={item.visible}
                          onChange={(e) => handleUpdateMenuItem(index, { visible: e.target.checked })}
                          style={{ marginTop: '5px', transform: 'scale(1.3)', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => moveMenuItem(index, 'up')}
                        disabled={index === 0}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: index === 0 ? '#ccc' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        ⬆️ Subir
                      </button>
                      <button
                        onClick={() => moveMenuItem(index, 'down')}
                        disabled={index === (schema.menuItems?.length || 0) - 1}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: index === (schema.menuItems?.length || 0) - 1 ? '#ccc' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: index === (schema.menuItems?.length || 0) - 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        ⬇️ Bajar
                      </button>
                      {!isSubitem && (
                        <>
                          <button
                            onClick={() => handleAddSubitem(item.path)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            ➕ Agregar Subitem
                          </button>
                          {/* Zona de drop para convertir en subitem */}
                          <div
                            onDragOver={handleMenuDragOver}
                            onDrop={(e) => handleMenuDropAsSubitem(e, item.path)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'rgba(40, 167, 69, 0.1)',
                              border: '1px dashed #28a745',
                              borderRadius: '3px',
                              fontSize: '10px',
                              color: '#28a745',
                              fontWeight: 'bold',
                              cursor: 'copy',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            ⤵ Soltar aquí para subitem
                          </div>
                        </>
                      )}
                      {isSubitem && (
                        <>
                          <button
                            onClick={() => handleConvertToMainItem(index)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                            }}
                          >
                            ⬅️ Convertir a Principal
                          </button>
                          <button
                            onClick={() => handleRemoveSubitem(index)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              marginLeft: 'auto',
                            }}
                          >
                            🗑️ Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {schema.type === 'table' && schema.columns?.map((column, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Etiqueta:</label>
                      <input
                        type="text"
                        value={column.label}
                        onChange={(e) => handleUpdateColumn(index, { label: e.target.value })}
                        style={{ width: '100%', padding: '5px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Tipo:</label>
                      <input
                        type="text"
                        value={column.dataType || 'text'}
                        readOnly
                        style={{ 
                          width: '100%', 
                          padding: '5px', 
                          fontSize: '12px', 
                          backgroundColor: '#e9ecef', 
                          textTransform: 'capitalize',
                          cursor: 'not-allowed',
                          color: '#6c757d'
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Visible:</label>
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={(e) => handleUpdateColumn(index, { visible: e.target.checked })}
                        style={{ marginTop: '3px', transform: 'scale(1.3)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                    <button
                      onClick={() => moveColumn(index, 'up')}
                      disabled={index === 0}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: index === 0 ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ⬆️ Subir
                    </button>
                    <button
                      onClick={() => moveColumn(index, 'down')}
                      disabled={index === (schema.columns?.length || 0) - 1}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: index === (schema.columns?.length || 0) - 1 ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: index === (schema.columns?.length || 0) - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ⬇️ Bajar
                    </button>
                  </div>
                </div>
              ))}
              {schema.type === 'form' && schema.fields?.map((field, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Campo:</label>
                      <input
                        type="text"
                        value={field.name}
                        readOnly
                        style={{ 
                          width: '100%', 
                          padding: '5px', 
                          fontSize: '12px',
                          backgroundColor: '#e9ecef',
                          cursor: 'not-allowed',
                          color: '#6c757d',
                          borderRadius: '4px',
                          border: '1px solid #ced4da'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Etiqueta:</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                        style={{ width: '100%', padding: '5px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ced4da' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Tipo:</label>
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(index, { type: e.target.value })}
                        style={{ width: '100%', padding: '5px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ced4da' }}
                      >
                        <option value="text">Texto</option>
                        <option value="email">Email</option>
                        <option value="number">Número</option>
                        <option value="date">Fecha</option>
                        <option value="textarea">Área de texto</option>
                        <option value="select">Select</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>Obligatorio:</label>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                        style={{ marginTop: '3px', transform: 'scale(1.3)' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: index === 0 ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ⬆️ Subir
                    </button>
                    <button
                      onClick={() => moveField(index, 'down')}
                      disabled={index === (schema.fields?.length || 0) - 1}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: index === (schema.fields?.length || 0) - 1 ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: index === (schema.fields?.length || 0) - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ⬇️ Bajar
                    </button>
                    <button
                      onClick={() => handleDeleteField(index)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Vista Previa</h3>
              {schema.type === 'form' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Layout:</label>
                  <select
                    value={schema.layout || 'grid-2cols'}
                    onChange={(e) => setSchema({ ...schema, layout: e.target.value })}
                    style={{ 
                      padding: '6px 10px', 
                      fontSize: '14px', 
                      border: '1px solid #007bff', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="single-column">1 Columna</option>
                    <option value="grid-2cols">2 Columnas</option>
                    <option value="grid-3cols">3 Columnas</option>
                  </select>
                </div>
              )}
            </div>
            <div
              style={{
                border: '2px dashed #007bff',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
              }}
            >
              {schema.type === 'menu' ? (
                  /* Vista previa de menú */
                  <div style={{ 
                    backgroundColor: '#2c3e50', 
                    padding: '20px', 
                    borderRadius: '8px',
                    minHeight: '400px'
                  }}>
                    <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '18px' }}>
                      {schema.title || 'Activos TI 2025'}
                    </h3>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(!schema.menuItems || schema.menuItems.length === 0) ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
                          No se encontraron elementos de menú
                        </div>
                      ) : (
                        <>
                          {/* Mostrar items principales y sus subitems agrupados */}
                          {schema.menuItems
                            .filter(item => item.visible && !item.parentPath)
                            .map((item, index) => {
                              // Encontrar subitems de este item
                              const subitems = (schema.menuItems || []).filter(
                                sub => sub.visible && sub.parentPath === item.path
                              );
                              
                              return (
                                <div key={index}>
                                  {/* Item principal */}
                                  <div
                                    style={{
                                      padding: '10px 15px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                      color: 'white',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      transition: 'all 0.2s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                    }}
                                  >
                                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                    <span style={{ 
                                      marginLeft: 'auto', 
                                      fontSize: '11px', 
                                      color: '#95a5a6' 
                                    }}>
                                      {item.path}
                                    </span>
                                  </div>
                                  
                                  {/* Subitems de este item */}
                                  {subitems.map((subitem, subIndex) => (
                                    <div
                                      key={`${index}-${subIndex}`}
                                      style={{
                                        padding: '10px 15px',
                                        paddingLeft: '40px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        borderLeft: '2px solid #3498db',
                                        marginTop: '4px',
                                      }}
                                    >
                                      <span style={{ color: '#95a5a6' }}>└─</span>
                                      <span style={{ fontSize: '16px' }}>{subitem.icon}</span>
                                      <span>{subitem.label}</span>
                                      <span style={{ 
                                        marginLeft: 'auto', 
                                        fontSize: '11px', 
                                        color: '#95a5a6' 
                                      }}>
                                        {subitem.path}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                        </>
                      )}
                    </nav>
                  </div>
                ) : schema.type === 'table' ? (
                  /* Vista previa de tabla */
                  <div style={{ overflowX: 'auto' }}>
                    {schema.title && (
                      <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>
                        {schema.title}
                      </h3>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          {schema.columns?.filter(col => col.visible).map((column, index) => (
                            <th
                              key={index}
                              style={{
                                padding: '12px',
                                textAlign: 'left',
                                borderBottom: '2px solid #dee2e6',
                                fontWeight: 'bold',
                                fontSize: '14px',
                              }}
                            >
                              {column.label}
                              <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '5px' }}>
                                ({column.dataType || 'text'})
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Fila de ejemplo */}
                        <tr>
                          {schema.columns?.filter(col => col.visible).map((column, index) => (
                            <td
                              key={index}
                              style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid #dee2e6',
                                fontSize: '14px',
                                color: '#6c757d',
                              }}
                            >
                              {column.dataType === 'date' ? '01/01/2025' :
                               column.dataType === 'number' ? '$1,000.00' :
                               column.dataType === 'action' ? '⚙️' :
                               'Ejemplo'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Vista previa de formulario */
                  <form>
                    {schema.title && (
                      <h3 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>
                        {schema.title}
                      </h3>
                    )}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          schema.layout === 'single-column'
                            ? '1fr'
                            : schema.layout === 'grid-3cols'
                            ? '1fr 1fr 1fr'
                            : '1fr 1fr',
                        gap: '15px',
                      }}
                    >
                    {(!schema.fields || schema.fields.length === 0) && (
                      <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                        No se encontraron campos en este formulario.
                      </div>
                    )}
                    {schema.fields?.map((field, index) => (
                      <div 
                        key={index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{
                          cursor: 'move',
                          backgroundColor: draggedIndex === index ? '#e3f2fd' : 'transparent',
                          padding: '5px',
                          borderRadius: '4px',
                          border: draggedIndex === index ? '2px dashed #007bff' : '2px solid transparent',
                        }}
                      >
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          🔄 {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            placeholder={`Ingrese ${field.label.toLowerCase()}`}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '14px',
                            }}
                            rows={3}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '14px',
                            }}
                          >
                            <option value="">-- Seleccionar --</option>
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <input type="checkbox" style={{ transform: 'scale(1.5)', marginTop: '5px' }} />
                        ) : (
                          <input
                            type={field.type}
                            placeholder={`Ingrese ${field.label.toLowerCase()}`}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '14px',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    style={{
                      marginTop: '20px',
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Enviar
                  </button>
                </form>
                )}
              </div>
            </div>
        </div>
      )}

      {/* Modal para seleccionar item como subitem */}
      {showSubitemModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '450px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Agregar Subitems</h3>
            <div style={{
              padding: '10px',
              backgroundColor: '#e7f3ff',
              border: '1px solid #0066cc',
              borderRadius: '6px',
              marginBottom: '12px',
            }}>
              <p style={{ fontSize: '13px', color: '#333', margin: 0, fontWeight: 'bold' }}>
                📌 Agregar como subitems de: <span style={{ color: '#0066cc' }}>{selectedParentPath}</span>
              </p>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
              Selecciona uno o más items del menú para convertirlos en subitems:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {schema.menuItems
                ?.filter(item => {
                  // No mostrar items que ya son subitems
                  if (item.parentPath) return false;
                  
                  // No mostrar el item actual
                  if (item.path === selectedParentPath) return false;
                  
                  // No mostrar items padres del item actual (evitar loops)
                  if (selectedParentPath.startsWith(item.path + '/')) return false;
                  
                  // No mostrar items que ya tienen subitems
                  const hasSubitems = schema.menuItems?.some(sub => sub.parentPath === item.path);
                  if (hasSubitems) return false;
                  
                  return true;
                })
                .map(item => {
                  const isSelected = selectedItemsForSubitem.includes(item.path);
                  return (
                    <label
                      key={item.path}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: isSelected ? '#e7f3ff' : '#f8f9fa',
                        border: `1px solid ${isSelected ? '#0066cc' : '#dee2e6'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        transition: 'all 0.2s',
                        color: '#000',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#e9ecef';
                          e.currentTarget.style.borderColor = '#adb5bd';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#dee2e6';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item.path)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#6c757d', paddingLeft: '42px' }}>{item.path}</span>
                    </label>
                  );
                })}
              
              {schema.menuItems?.filter(item => 
                !item.parentPath && 
                item.path !== selectedParentPath &&
                !selectedParentPath.startsWith(item.path + '/')
              ).length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '16px', margin: 0 }}>
                  No hay items disponibles para convertir en subitem
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={handleAddSelectedSubitems}
                disabled={selectedItemsForSubitem.length === 0}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: selectedItemsForSubitem.length === 0 ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: selectedItemsForSubitem.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Agregar ({selectedItemsForSubitem.length})
              </button>
              <button
                onClick={() => {
                  setShowSubitemModal(false);
                  setSelectedParentPath('');
                  setSelectedItemsForSubitem([]);
                }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationView;
