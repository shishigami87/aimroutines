"use client";

import { useState, useLayoutEffect, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { User } from "next-auth";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Input } from "./input";
import { Strategy } from "@/lib/constants";
import { RoutineData } from "@/shared/types/routine";
import clsx from "clsx";

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  user: User | null | undefined;
  highlightedRowId: string | undefined;
  onStrategyChange?: (newStrategy: Strategy) => void;
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  user,
  highlightedRowId,
  onStrategyChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
    },
  });

  const [isMounted, setIsMounted] = useState(false);

  const debouncedOnChange = useDebouncedCallback((value) => {
    table.getColumn("title")?.setFilterValue(value);
  }, 200);

  // Prevents hydration error
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (highlightedRowId) {
      const row = table.getRow(highlightedRowId);
      if (row) {
        document.getElementById(highlightedRowId)?.scrollIntoView();
      }
    }
  }, [highlightedRowId]);

  if (!isMounted) return null;

  return (
    <div>
      <div className="flex items-center gap-2 pb-4">
        <Input
          autoComplete="off"
          placeholder="Filter by title or share code"
          onChange={(event) => debouncedOnChange(event.target.value)}
          className="max-w-sm"
        />
        <Select
          onValueChange={(value) => {
            if (value === "ANY") {
              table.getColumn("game")?.setFilterValue(undefined);
            } else {
              table.getColumn("game")?.setFilterValue(value);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">--- Any ---</SelectItem>
            <SelectItem value="KOVAAKS">Kovaaks</SelectItem>
            <SelectItem value="AIMLABS">Aimlabs</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1"></div>
        <Select
          defaultValue="all-routines"
          onValueChange={(value) => {
            onStrategyChange?.(value as Strategy);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-routines">All routines</SelectItem>
            {user && (
              <SelectItem value="liked-routines">Liked routines</SelectItem>
            )}
            <SelectItem value="recommend-beginners">
              Beginner routines
            </SelectItem>
            <SelectItem value="only-benchmarks">Only benchmarks</SelectItem>
            {user && (
              <SelectItem value="active-benchmarks">
                Active benchmarks
              </SelectItem>
            )}
            <SelectItem value="no-benchmarks">No benchmarks</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="max-h-[calc(100vh-212px-68px)] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-inherit">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-zinc-900 ${clsx({ "bg-rose-950": row.id === highlightedRowId })}`}
                  id={row.original.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
