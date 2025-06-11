-- =============================================
-- MEDICONSA 2025 - ESQUEMA BASE DE DATOS
-- =============================================

-- 1. PERFILES DE USUARIO
CREATE TABLE perfiles_usuario (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  nombre_usuario TEXT UNIQUE NOT NULL,
  telefono TEXT,
  avatar_url TEXT,
  tipo_usuario TEXT DEFAULT 'estudiante' CHECK (tipo_usuario IN ('admin', 'instructor', 'estudiante')),
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CURSOS
CREATE TABLE cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  slug TEXT UNIQUE NOT NULL,
  miniatura_url TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  descuento INTEGER DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
  tipo_examen TEXT CHECK (tipo_examen IN ('medico_general', 'medico_rural', 'caces', 'senesyct')),
  es_gratuito BOOLEAN DEFAULT false,
  instructor_id UUID REFERENCES auth.users(id),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MÓDULOS
CREATE TABLE modulos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLASES
CREATE TABLE clases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  video_youtube_url TEXT,
  duracion_minutos INTEGER,
  es_gratuita BOOLEAN DEFAULT false,
  orden INTEGER NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MATERIALES DESCARGABLES
CREATE TABLE materiales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  archivo_url TEXT NOT NULL,
  tipo_archivo TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  es_gratuito BOOLEAN DEFAULT false,
  curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SIMULACROS
CREATE TABLE simulacros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  modo_evaluacion TEXT NOT NULL CHECK (modo_evaluacion IN ('practica', 'realista', 'examen')),
  tiempo_limite_minutos INTEGER,
  tiempo_por_pregunta_segundos INTEGER,
  numero_preguntas INTEGER NOT NULL,
  intentos_permitidos INTEGER DEFAULT -1,
  randomizar_preguntas BOOLEAN DEFAULT true,
  randomizar_opciones BOOLEAN DEFAULT true,
  mostrar_respuestas_despues INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PREGUNTAS
CREATE TABLE preguntas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  simulacro_id UUID REFERENCES simulacros(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  tipo_pregunta TEXT NOT NULL CHECK (tipo_pregunta IN ('multiple', 'multiple_respuesta', 'completar', 'unir', 'rellenar')),
  explicacion TEXT,
  imagen_url TEXT, -- IMPORTANTE: Para las imágenes médicas
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. OPCIONES DE RESPUESTA
CREATE TABLE opciones_respuesta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pregunta_id UUID REFERENCES preguntas(id) ON DELETE CASCADE,
  texto_opcion TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false,
  orden INTEGER NOT NULL
);

-- 9. INSCRIPCIONES
CREATE TABLE inscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'habilitado')),
  fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_habilitacion TIMESTAMP WITH TIME ZONE,
  habilitado_por UUID REFERENCES auth.users(id),
  UNIQUE(usuario_id, curso_id)
);

-- 10. PROGRESO DE CLASES
CREATE TABLE progreso_clases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
  completada BOOLEAN DEFAULT false,
  porcentaje_visto INTEGER DEFAULT 0 CHECK (porcentaje_visto >= 0 AND porcentaje_visto <= 100),
  fecha_ultima_vista TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, clase_id)
);

-- 11. INTENTOS DE SIMULACRO
CREATE TABLE intentos_simulacro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  simulacro_id UUID REFERENCES simulacros(id) ON DELETE CASCADE,
  puntaje DECIMAL(5,2),
  total_preguntas INTEGER,
  respuestas_correctas INTEGER,
  tiempo_empleado_minutos INTEGER,
  fecha_intento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. RESPUESTAS DE USUARIO (para guardar qué respondió)
CREATE TABLE respuestas_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intento_simulacro_id UUID REFERENCES intentos_simulacro(id) ON DELETE CASCADE,
  pregunta_id UUID REFERENCES preguntas(id) ON DELETE CASCADE,
  opcion_seleccionada_id UUID REFERENCES opciones_respuesta(id) ON DELETE CASCADE,
  es_correcta BOOLEAN DEFAULT false,
  fecha_respuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_cursos_instructor ON cursos(instructor_id);
CREATE INDEX idx_cursos_slug ON cursos(slug);
CREATE INDEX idx_modulos_curso ON modulos(curso_id, orden);
CREATE INDEX idx_clases_modulo ON clases(modulo_id, orden);
CREATE INDEX idx_inscripciones_usuario ON inscripciones(usuario_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado_pago);
CREATE INDEX idx_progreso_usuario ON progreso_clases(usuario_id);

-- =============================================
-- DATOS DE PRUEBA
-- =============================================

-- Primero necesitamos crear los usuarios de prueba manualmente en Supabase Auth
-- Ve a Authentication > Users y crea:
-- 1. admin@mediconsa.com / admin123med
-- 2. estudiante@mediconsa.com / estudiante123

-- Después ejecuta esto (reemplaza los UUIDs con los reales de Supabase):
-- INSERT INTO perfiles_usuario (id, nombre_completo, nombre_usuario, tipo_usuario) VALUES
-- ('UUID_DEL_ADMIN', 'Administrador Mediconsa', 'admin.mediconsa', 'admin'),
-- ('UUID_DEL_ESTUDIANTE', 'Estudiante Prueba', 'estudiante.prueba', 'estudiante');

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacros ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE opciones_respuesta ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_simulacro ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_usuario ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA ADMINS (acceso total)
CREATE POLICY "Admins pueden todo en perfiles_usuario" ON perfiles_usuario
  FOR ALL USING (
    (SELECT tipo_usuario FROM perfiles_usuario WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins pueden todo en cursos" ON cursos
  FOR ALL USING (
    (SELECT tipo_usuario FROM perfiles_usuario WHERE id = auth.uid()) = 'admin'
  );

-- POLÍTICAS PARA ESTUDIANTES Y LECTURA PÚBLICA
CREATE POLICY "Todos pueden ver cursos activos" ON cursos
  FOR SELECT USING (activo = true);

CREATE POLICY "Usuarios pueden ver su propio perfil" ON perfiles_usuario
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON perfiles_usuario
  FOR UPDATE USING (id = auth.uid());

-- POLÍTICAS PARA INSCRIPCIONES
CREATE POLICY "Usuarios pueden ver sus inscripciones" ON inscripciones
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden inscribirse" ON inscripciones
  FOR INSERT WITH CHECK (usuario_id = auth.uid());





-- =============================================
-- CONFIGURAR RLS DESDE CERO
-- =============================================

-- Habilitar RLS en tablas principales
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_simulacro ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS SIMPLES Y SEGURAS
-- Perfiles: usuarios solo ven su propio perfil
CREATE POLICY "usuarios_propio_perfil" ON perfiles_usuario
  FOR ALL USING (auth.uid() = id);

-- Cursos: todos pueden ver cursos activos
CREATE POLICY "cursos_publicos" ON cursos
  FOR SELECT USING (activo = true);

-- Inscripciones: usuarios solo ven sus inscripciones
CREATE POLICY "inscripciones_propias" ON inscripciones
  FOR ALL USING (auth.uid() = usuario_id);

-- Progreso: usuarios solo ven su progreso
CREATE POLICY "progreso_propio" ON progreso_clases
  FOR ALL USING (auth.uid() = usuario_id);

-- Intentos: usuarios solo ven sus intentos
CREATE POLICY "intentos_propios" ON intentos_simulacro
  FOR ALL USING (auth.uid() = usuario_id);





       -- =============================================
-- LIMPIAR TODO EL RLS Y CONFIGURAR CORRECTAMENTE
-- =============================================

-- 1. DESHABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE perfiles_usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE modulos DISABLE ROW LEVEL SECURITY;
ALTER TABLE clases DISABLE ROW LEVEL SECURITY;
ALTER TABLE materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE simulacros DISABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE opciones_respuesta DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_clases DISABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_simulacro DISABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_usuario DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DO $$
DECLARE
pol RECORD;
BEGIN
FOR pol IN
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      pol.policyname, pol.schemaname, pol.tablename);
END LOOP;
END $$;

-- 3. HABILITAR RLS SOLO EN TABLAS CRÍTICAS
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_simulacro ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_usuario ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS SIMPLES Y FUNCIONALES
-- Perfiles: usuarios ven solo su perfil
CREATE POLICY "usuarios_su_perfil" ON perfiles_usuario
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Inscripciones: usuarios ven solo sus inscripciones
CREATE POLICY "usuarios_sus_inscripciones" ON inscripciones
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Progreso: usuarios ven solo su progreso
CREATE POLICY "usuarios_su_progreso" ON progreso_clases
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Intentos: usuarios ven solo sus intentos
CREATE POLICY "usuarios_sus_intentos" ON intentos_simulacro
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Respuestas: usuarios ven solo sus respuestas
CREATE POLICY "usuarios_sus_respuestas" ON respuestas_usuario
  FOR ALL USING (
    auth.uid() = (
      SELECT usuario_id FROM intentos_simulacro
      WHERE id = intento_simulacro_id
    )
  );

-- 5. VERIFICAR QUE TODO ESTÉ LIMPIO
SELECT
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. VERIFICAR POLÍTICAS RESTANTES
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';





--mayores cambios de politicas

-- =============================================
-- MEDICONSA 2025 - LIMPIEZA TOTAL SUPABASE
-- =============================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "usuarios_sus_inscripciones" ON inscripciones;
DROP POLICY IF EXISTS "usuarios_sus_intentos" ON intentos_simulacro;
DROP POLICY IF EXISTS "usuarios_su_perfil" ON perfiles_usuario;
DROP POLICY IF EXISTS "usuarios_su_progreso" ON progreso_clases;
DROP POLICY IF EXISTS "usuarios_sus_respuestas" ON respuestas_usuario;

-- 2. DESHABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE perfiles_usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE modulos DISABLE ROW LEVEL SECURITY;
ALTER TABLE clases DISABLE ROW LEVEL SECURITY;
ALTER TABLE materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE simulacros DISABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE opciones_respuesta DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_clases DISABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_simulacro DISABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_usuario DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR QUE TODO ESTÉ LIMPIO
SELECT
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'perfiles_usuario', 'cursos', 'modulos', 'clases',
        'inscripciones', 'progreso_clases', 'simulacros',
        'preguntas', 'intentos_simulacro', 'respuestas_usuario'
    )
ORDER BY tablename;

