import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  dto: PaginationDto,
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 100 } = dto;

  const total = await queryBuilder.getCount();

  const data = await queryBuilder
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
