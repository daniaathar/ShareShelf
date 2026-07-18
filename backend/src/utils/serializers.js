export const userResponse = (user) => ({ id: user.id, name: user.name, email: user.email, city: user.city, area: user.area, createdAt: user.createdAt });
export const itemResponse = (item) => ({ ...item, owner: item.owner ? { id: item.owner.id, name: item.owner.name } : undefined });
