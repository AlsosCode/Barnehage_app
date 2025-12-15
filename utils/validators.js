const { normalizeGroupLabel } = require('./dbDriver');

function cleanString(value) {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateLength(field, value, max) {
  if (value && value.length > max) {
    const err = new Error(`${field} is too long (max ${max} characters)`);
    err.status = 400;
    throw err;
  }
}

function validateActivityPayload(body) {
  const title = cleanString(body.title);
  const description = cleanString(body.description);

  if (!isNonEmptyString(title) || !isNonEmptyString(description)) {
    const err = new Error('Title and description are required');
    err.status = 400;
    throw err;
  }

  validateLength('title', title, 200);
  validateLength('description', description, 2000);

  const group = body.group ? normalizeGroupLabel(body.group) : undefined;

  let media = undefined;
  if (Array.isArray(body.media)) {
    if (body.media.length > 12) {
      const err = new Error('Too many media items (max 12)');
      err.status = 400;
      throw err;
    }

    media = body.media
      .filter((m) => m && m.url && (m.type === 'image' || m.type === 'video'))
      .map((m) => ({
        type: m.type,
        url: cleanString(m.url),
        posterUrl: m.posterUrl ? cleanString(m.posterUrl) : undefined,
      }));
  }

  return {
    title,
    description,
    group,
    media,
    imageUrl: cleanString(body.imageUrl),
    videoUrl: cleanString(body.videoUrl),
  };
}

function validateChildPayload(body) {
  const name = cleanString(body.name);
  const group = cleanString(body.group);
  const parentId = body.parentId;

  if (!isNonEmptyString(name) || !isNonEmptyString(group) || !parentId) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  validateLength('name', name, 200);

  return {
    name,
    birthDate: cleanString(body.birthDate),
    age: typeof body.age === 'number' ? body.age : parseInt(body.age, 10),
    group,
    allergies: Array.isArray(body.allergies)
      ? body.allergies.map((a) => cleanString(a)).filter(Boolean)
      : [],
    status: body.status,
    parentId,
  };
}

function validateParentPayload(body) {
  const name = cleanString(body.name);
  const email = cleanString(body.email);
  const phone = cleanString(body.phone);

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(phone)) {
    const err = new Error('Missing required fields: name, email, phone');
    err.status = 400;
    throw err;
  }

  validateLength('name', name, 200);
  validateLength('email', email, 320);
  validateLength('phone', phone, 50);

  return {
    name,
    email,
    phone,
    address: cleanString(body.address),
    verified: typeof body.verified === 'boolean' ? body.verified : false,
    childrenIds: Array.isArray(body.childrenIds) ? body.childrenIds : [],
  };
}

module.exports = {
  validateActivityPayload,
  validateChildPayload,
  validateParentPayload,
};
