export interface AttributeConfig {
    name: string;   // Nombre del atributo (e.g., 'color', 'size')
    label:string;
    type: string;   // Tipo de dato (e.g., 'string', 'number', 'boolean')
    options?: string[];  // Opciones en caso de que el tipo sea select, radio, etc.
    required: boolean;  // Indica si el atributo es obligatorio
  }
  