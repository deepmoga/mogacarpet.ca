import { query } from './db';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  display_order: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export async function ensureBannersTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) DEFAULT '',
        image_url TEXT NOT NULL,
        link_url TEXT DEFAULT '',
        alt_text VARCHAR(255) DEFAULT '',
        display_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if table is empty
    const rows = await query<{ cnt: number }[]>('SELECT COUNT(*) AS cnt FROM banners');
    if (rows && rows[0]?.cnt === 0) {
      await query(`
        INSERT INTO banners (title, image_url, link_url, alt_text, display_order, is_active)
        VALUES 
          ('Grand Flooring Event', '/images/slide01.jpg', '/shop', 'Moga Carpet & Flooring Special Offers', 1, 1),
          ('Commercial & Residential Excellence', '/images/slide02.jpg', '/category/vinyl-flooring', 'High-Performance Vinyl Planks & Carpet Tiles', 2, 1),
          ('Timeless Luxury & Comfort', '/images/slide03.jpg', '/products', 'Authentic Canadian Wood & Underpad', 3, 1)
      `);
    }
  } catch (err) {
    console.warn('Could not ensure banners table:', err);
  }
}

export async function getActiveBanners(): Promise<Banner[]> {
  try {
    await ensureBannersTable();
    const rows = await query<Banner[]>(
      'SELECT id, title, image_url, link_url, alt_text, display_order, is_active FROM banners WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
    );
    return rows || [];
  } catch (err) {
    console.warn('Failed to get active banners:', err);
    return [];
  }
}

export async function getAllBanners(): Promise<Banner[]> {
  try {
    await ensureBannersTable();
    const rows = await query<Banner[]>(
      'SELECT id, title, image_url, link_url, alt_text, display_order, is_active, created_at, updated_at FROM banners ORDER BY display_order ASC, id ASC'
    );
    return rows || [];
  } catch (err) {
    console.warn('Failed to get all banners:', err);
    return [];
  }
}

export async function createBanner(data: {
  title?: string;
  image_url: string;
  link_url?: string;
  alt_text?: string;
  display_order?: number;
  is_active?: number;
}): Promise<number> {
  await ensureBannersTable();
  const res = await query<any>(
    `INSERT INTO banners (title, image_url, link_url, alt_text, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.title || '',
      data.image_url,
      data.link_url || '',
      data.alt_text || '',
      data.display_order ?? 0,
      data.is_active ?? 1,
    ]
  );
  return res.insertId;
}

export async function updateBanner(
  id: number,
  data: {
    title?: string;
    image_url?: string;
    link_url?: string;
    alt_text?: string;
    display_order?: number;
    is_active?: number;
  }
): Promise<void> {
  await ensureBannersTable();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    values.push(data.title);
  }
  if (data.image_url !== undefined) {
    fields.push('image_url = ?');
    values.push(data.image_url);
  }
  if (data.link_url !== undefined) {
    fields.push('link_url = ?');
    values.push(data.link_url);
  }
  if (data.alt_text !== undefined) {
    fields.push('alt_text = ?');
    values.push(data.alt_text);
  }
  if (data.display_order !== undefined) {
    fields.push('display_order = ?');
    values.push(data.display_order);
  }
  if (data.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }

  if (fields.length === 0) return;

  values.push(id);
  await query(`UPDATE banners SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteBanner(id: number): Promise<void> {
  await ensureBannersTable();
  await query('DELETE FROM banners WHERE id = ?', [id]);
}
