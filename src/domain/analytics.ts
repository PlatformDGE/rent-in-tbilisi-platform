import { pricePerM2, safeNumber } from './formatters';
import type { Agent, Deal, Property, Publication } from './types';

export function minPositive(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  return filtered.length ? Math.min(...filtered) : 0;
}

export function maxPositive(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  return filtered.length ? Math.max(...filtered) : 0;
}

export function getPropertyStats(properties: Property[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const monthStart = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const realized = properties.filter((property) => property.status === 'Rented' || property.status === 'Sold');
  const addedWeek = properties.filter((property) => Date.parse(property.createdAt) >= weekStart).length;
  const addedMonth = properties.filter((property) => Date.parse(property.createdAt) >= monthStart).length;
  const realizedWeek = realized.filter((property) => Date.parse(property.updatedAt) >= weekStart).length;
  const realizedMonth = realized.filter((property) => Date.parse(property.updatedAt) >= monthStart).length;
  return {
    total: properties.length,
    active: properties.filter((property) => !['Rented', 'Sold', 'Archived'].includes(property.status)).length,
    inWork: properties.filter((property) => property.status === 'In Progress').length,
    onAds: properties.filter((property) => property.status === 'On Advertising').length,
    rented: properties.filter((property) => property.status === 'Rented').length,
    sold: properties.filter((property) => property.status === 'Sold').length,
    archived: properties.filter((property) => property.status === 'Archived').length,
    exclusive: properties.filter((property) => property.exclusive).length,
    rentedToday: properties.filter((property) => property.status === 'Rented' && Date.parse(property.updatedAt) >= todayStart).length,
    rentedWeek: properties.filter((property) => property.status === 'Rented' && Date.parse(property.updatedAt) >= weekStart).length,
    rentedMonth: properties.filter((property) => property.status === 'Rented' && Date.parse(property.updatedAt) >= monthStart).length,
    soldWeek: properties.filter((property) => property.status === 'Sold' && Date.parse(property.updatedAt) >= weekStart).length,
    soldMonth: properties.filter((property) => property.status === 'Sold' && Date.parse(property.updatedAt) >= monthStart).length,
    addedWeek,
    addedMonth,
    realizedWeek,
    realizedMonth,
    conversionRate: properties.length ? Math.round((realized.length / properties.length) * 100) : 0,
  };
}

export function getDistricts(properties: Property[]) {
  return Array.from(new Set(properties.map((property) => property.district).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function thisWeekCount(publications: Publication[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return publications.filter((publication) => Date.parse(publication.date) >= weekAgo).length;
}

export function thisMonthCount(publications: Publication[]) {
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return publications.filter((publication) => Date.parse(publication.date) >= monthAgo).length;
}

export function average(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  return filtered.length ? Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length) : 0;
}

export function median(values: number[]) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!filtered.length) return 0;
  const middle = Math.floor(filtered.length / 2);
  return filtered.length % 2 ? filtered[middle] : Math.round((filtered[middle - 1] + filtered[middle]) / 2);
}

export function districtAnalytics(properties: Property[]) {
  return getDistricts(properties).map((district) => {
    const districtProperties = properties.filter((property) => property.district === district);
    const rent = districtProperties.filter((property) => property.dealType === 'Rent');
    const sale = districtProperties.filter((property) => property.dealType === 'Sale');
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return {
      district,
      rentCount: rent.length,
      avgRent: average(rent.map((property) => safeNumber(property.price))),
      medianRent: median(rent.map((property) => safeNumber(property.price))),
      minRent: minPositive(rent.map((property) => safeNumber(property.price))),
      maxRent: maxPositive(rent.map((property) => safeNumber(property.price))),
      avgRentM2: average(rent.map(pricePerM2)),
      saleCount: sale.length,
      avgSale: average(sale.map((property) => safeNumber(property.price))),
      medianSale: median(sale.map((property) => safeNumber(property.price))),
      avgSaleM2: average(sale.map(pricePerM2)),
      avg1Bed: average(rent.filter((property) => property.bedrooms === '1').map((property) => safeNumber(property.price))),
      avg2Bed: average(rent.filter((property) => property.bedrooms === '2').map((property) => safeNumber(property.price))),
      avg3Bed: average(rent.filter((property) => property.bedrooms === '3').map((property) => safeNumber(property.price))),
      realizedMonth: districtProperties.filter(
        (property) => ['Rented', 'Sold'].includes(property.status) && Date.parse(property.updatedAt) >= monthAgo,
      ).length,
    };
  });
}

export function agentAnalytics(agents: Agent[], properties: Property[], deals: Deal[], publications: Publication[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return agents
    .map((agent) => {
      const agentProperties = properties.filter((property) => property.agent === agent.name);
      const agentDeals = deals.filter((deal) => deal.agent === agent.name);
      const realized = agentProperties.filter((property) => ['Rented', 'Sold'].includes(property.status));
      const commissions = agentDeals.map((deal) => safeNumber(deal.commission));
      return {
        ...agent,
        objects: agentProperties.length,
        exclusives: agentProperties.filter((property) => property.exclusive).length,
        rented: agentProperties.filter((property) => property.status === 'Rented').length,
        sold: agentProperties.filter((property) => property.status === 'Sold').length,
        deals: agentDeals.length,
        commissionSum: commissions.reduce((sum, value) => sum + value, 0),
        avgCommission: average(commissions),
        conversion: agentProperties.length ? Math.round((realized.length / agentProperties.length) * 100) : 0,
        weekActivity: agentProperties.filter((property) => Date.parse(property.updatedAt) >= weekAgo).length,
        monthActivity: agentProperties.filter((property) => Date.parse(property.updatedAt) >= monthAgo).length,
        publications: publications.filter((publication) => publication.author === agent.name).length,
      };
    })
    .sort((a, b) => b.commissionSum - a.commissionSum || b.exclusives - a.exclusives);
}
