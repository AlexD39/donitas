CREATE TABLE IF NOT EXISTS tienda (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL DEFAULT 'Donitas Anita',
    eslogan VARCHAR(200) DEFAULT 'Hechas con amor',
    introduccion TEXT,
    descripcion TEXT,
    logo TEXT,
    portada TEXT,
    whatsapp VARCHAR(20),
    direccion TEXT,
    horarios TEXT,
    facebook TEXT,
    instagram TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    imagen TEXT,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tienda (
    nombre,
    eslogan,
    introduccion,
    descripcion,
    whatsapp,
    direccion,
    horarios
)
SELECT
    'Donitas Anita',
    'Hechas con amor',
    'Donas artesanales preparadas especialmente para endulzar tus momentos.',
    'En Donitas Anita elaboramos productos frescos, deliciosos y preparados con mucho cariño.',
    '522361170217',
    'Zinacatepec, Puebla',
    'Lunes a sábado de 9:00 a 19:00'
WHERE NOT EXISTS (
    SELECT 1 FROM tienda
);

INSERT INTO productos (
    nombre,
    descripcion,
    precio,
    imagen,
    disponible,
    destacado
)
SELECT
    'Dona de fresa',
    'Dona artesanal con cobertura de fresa y chispas de colores.',
    25.00,
    'https://images.unsplash.com/photo-1551024601-bec78aea704b',
    TRUE,
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM productos
);