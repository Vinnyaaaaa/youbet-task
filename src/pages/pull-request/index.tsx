import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchPullRequests } from '@/service'
import { PullRequest, IResultPaginationData } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { format } from 'date-fns'
import { SkeletonCard } from '@/components/skeleton-card'

function LoadingPage(): React.ReactElement {
  return (
    <>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </>
  )
}

// TODO: reward feature
function PullRequestsTable(): React.ReactElement {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const pageSize = 10

  const { data, isLoading } = useQuery<IResultPaginationData<PullRequest>>({
    queryKey: ['pullRequests', page, pageSize, searchTerm, statusFilter],
    queryFn: () => {
      return fetchPullRequests({
        state: statusFilter === 'all' ? undefined : statusFilter,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        search: searchTerm,
      })
    },
    keepPreviousData: true,
  })

  const totalPages = Math.ceil((data?.pagination.totalCount || 0) / pageSize)

  const filteredData =
    data?.data.filter(
      (pr) =>
        pr.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'all' || pr.state === statusFilter),
    ) || []

  if (isLoading) return <LoadingPage />

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          placeholder="Filter pull requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-transparent border-gray-700"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="border-gray-700 bg-transparent w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-gray-400">Number</TableHead>
            <TableHead className="text-gray-400">Title</TableHead>
            <TableHead className="text-gray-400">Created At</TableHead>
            <TableHead className="text-gray-400">State</TableHead>
            <TableHead className="text-gray-400">User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((pr) => (
            <TableRow key={pr.githubId}>
              <TableCell className="font-medium">{pr.githubId}</TableCell>
              <TableCell>
                <a href={pr.htmlUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {pr.title}
                </a>
              </TableCell>
              <TableCell>{format(new Date(pr.createdAt), 'MMMM do, yyyy')}</TableCell>
              <TableCell>{pr.state}</TableCell>
              <TableCell>
                <a href={pr.user.htmlUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {pr.user.login}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="text-gray-400 bg-transparent border-gray-700 hover:bg-gray-800"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-gray-400 bg-transparent border-gray-700 hover:bg-gray-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-gray-400 bg-transparent border-gray-700 hover:bg-gray-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="text-gray-400 bg-transparent border-gray-700 hover:bg-gray-800"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PullRequestAdmin() {
  return (
    <div className="px-4 py-4 mx-auto lg:px-12 max-w-7xl">
      <PullRequestsTable />
    </div>
  )
}
