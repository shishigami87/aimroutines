"use client";

import { useState, useLayoutEffect, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { User } from "next-auth";
import { useSearchParams } from "next/navigation";

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
import { Strategies, Strategy } from "@/lib/constants";
import { RoutineData } from "@/shared/types/routine";
import clsx from "clsx";
import { Button } from "./button";
import { Share1Icon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";

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

  const { toast } = useToast();

  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q");
  const gameFromUrl = searchParams.get("g");
  const strategyFromUrl = searchParams.get("s");

  const [strategy, setStrategy] = useState<Strategy>(
    strategyFromUrl ? (strategyFromUrl as Strategy) : "all-routines",
  );

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
    if (queryFromUrl) {
      table.getColumn("title")?.setFilterValue(queryFromUrl);
    }
  }, [queryFromUrl]);

  useEffect(() => {
    if (gameFromUrl) {
      table.getColumn("game")?.setFilterValue(gameFromUrl.toUpperCase());
    }
  }, [gameFromUrl]);

  useEffect(() => {
    if (strategyFromUrl) {
      onStrategyChange?.(
        strategyFromUrl in Strategies
          ? (strategyFromUrl as Strategy)
          : "all-routines",
      );
    }
  }, [strategyFromUrl]);

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
          defaultValue={queryFromUrl ?? ""}
          onChange={(event) => debouncedOnChange(event.target.value)}
          className="max-w-sm"
        />
        <Select
          defaultValue={gameFromUrl?.toUpperCase() ?? undefined}
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
          value={strategy}
          defaultValue={strategyFromUrl ?? "all-routines"}
          onValueChange={(value) => {
            setStrategy(value as Strategy);
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
            <SelectItem value="beginner-recommendations">
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
      <div className="max-h-[calc(100vh-212px-68px-60px)] overflow-y-auto rounded-md border">
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
      <div className="flex items-center justify-end py-2">
        <Button
          variant="link"
          size="sm"
          className="px-0 text-primary-foreground"
          onClick={async () => {
            const titleFilter = table
              .getColumn("title")
              ?.getFilterValue() as string;
            const gameFilter = table
              .getColumn("game")
              ?.getFilterValue() as string;

            const urlParams = new URLSearchParams();
            if (titleFilter) urlParams.set("q", titleFilter);
            if (gameFilter) urlParams.set("g", gameFilter.toLowerCase());
            if (strategy !== "all-routines") urlParams.set("s", strategy);

            if (urlParams.size > 0) {
              await navigator.clipboard.writeText(
                `${window.location.origin}/?${urlParams.toString()}`,
              );
            } else {
              await navigator.clipboard.writeText(window.location.origin);
            }

            toast({
              description: "URL copied to clipboard",
            });
          }}
        >
          Share results
          <Share1Icon />
        </Button>
      </div>
    </div>
  );
}
