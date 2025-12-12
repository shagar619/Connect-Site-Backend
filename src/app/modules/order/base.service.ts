/* eslint-disable @typescript-eslint/no-explicit-any */

import { Model, PopulateOptions, Types } from "mongoose";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

// ──────────────────────────────────────────
// 🔥 GENERIC GET SINGLE
// ──────────────────────────────────────────
const getSingle = async <T>(
  Model: Model<T>,
  id: string | Types.ObjectId,
  populate?: string | string[] | PopulateOptions | PopulateOptions[]
) => {
  const query = Model.findById(id);

  // Optional populate support (Fix for TS overload error)
  if (populate) {
    query.populate(populate as any);
  }

  const result = await query.lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, `${Model.modelName} not found.`);
  }

  return result;
};

// ──────────────────────────────────────────
// 🔥 GENERIC GET ALL (Filters + Pagination + Sorting)
// ──────────────────────────────────────────
const getAll = async <T>(
  Model: Model<T>,
  query: Record<string, any>,
  filter: Record<string, any> = {},
  populate?: string | string[] | PopulateOptions | PopulateOptions[]
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Add role-based filters + query filters
  const finalFilter = { ...filter };

  // Sorting
  const sort = query.sortBy || "-createdAt";

  const resultsQuery = Model.find(finalFilter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Optional population support
  if (populate) {
    resultsQuery.populate(populate as any);
  }

  const results = await resultsQuery.lean();
  const total = await Model.countDocuments(finalFilter);

  return {
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: results,
  };
};

// ──────────────────────────────────────────
// ❌ GENERIC SOFT DELETE
// ──────────────────────────────────────────
const deleteSingle = async <T>(
  Model: Model<T>,
  id: string | Types.ObjectId
) => {
  const result = await Model.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, `${Model.modelName} not found.`);
  }

  return result;
};

// ──────────────────────────────────────────
// 📦 EXPORT
// ──────────────────────────────────────────
export const GenericService = {
  getSingle,
  getAll,
  deleteSingle,
};
