import fs from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

export const uploadsBaseDir = isProd
  ? '/tmp/uploads'
  : path.join(process.cwd(), 'uploads');

export const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsBaseDir)) {
    fs.mkdirSync(uploadsBaseDir, { recursive: true });
  }
};

export const ensureEmpresaUploadsDir = (empresaId: number) => {
  ensureUploadsDir();
  const dir = path.join(uploadsBaseDir, String(empresaId));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};
