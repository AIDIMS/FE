import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Camera, Plus, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { ImagingOrder } from '@/lib/types/patient';

interface ImagingOrdersCardProps {
	imagingOrders: ImagingOrder[];
	onAddOrder: () => void;
	onEditOrder: (order: ImagingOrder) => void;
	onDeleteOrder: (order: ImagingOrder) => void;
	onViewImages?: (order: ImagingOrder) => void;
	getStatusBadge: (status: string) => React.ReactNode;
}

export function ImagingOrdersCard({
	imagingOrders,
	onAddOrder,
	onEditOrder,
	onDeleteOrder,
	onViewImages,
	getStatusBadge,
}: ImagingOrdersCardProps) {
	return (
		<Card className="border-2 border-blue-600 bg-white shadow-sm">
			<CardHeader className="pb-4 border-b border-slate-200">
				<div className="flex items-center gap-2">
					<Camera className="h-4 w-4 text-blue-600" />
					<CardTitle className="text-sm font-semibold text-slate-900">
						Chỉ định chụp chiếu
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-4">
				{/* Add Order Button */}
				<Button
					onClick={onAddOrder}
					className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4 h-11 font-semibold"
				>
					<Plus className="h-5 w-5 mr-2" />
					Thêm Chỉ Định
				</Button>

				{/* Summary Stats - Minimal */}
				<div className="grid grid-cols-3 gap-2 mb-4">
					<div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
						<p className="text-xl font-bold text-slate-900">{imagingOrders.length}</p>
						<p className="text-xs text-slate-500 mt-1">Tổng</p>
					</div>
					<div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
						<p className="text-xl font-bold text-slate-900">
							{imagingOrders.filter(o => o.status === 'pending').length}
						</p>
						<p className="text-xs text-slate-500 mt-1">Chờ</p>
					</div>
					<div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
						<p className="text-xl font-bold text-slate-900">
							{imagingOrders.filter(o => o.status === 'completed').length}
						</p>
						<p className="text-xs text-slate-500 mt-1">Xong</p>
					</div>
				</div>

				{/* Orders List */}
				{imagingOrders.length === 0 ? (
					<div className="text-center py-10 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
						<Camera className="h-10 w-10 text-slate-300 mx-auto mb-3" />
						<p className="text-sm text-slate-500">Chưa có chỉ định</p>
					</div>
				) : (
					<div className="space-y-2">
						{imagingOrders.map(order => (
							<div
								key={order.id}
								className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-3 flex-1">
										<div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
											<Camera className="h-4 w-4 text-slate-600" />
										</div>
										<div>
											<p className="text-sm font-semibold text-slate-900">
												{order.modalityRequested}
											</p>
											<p className="text-xs text-slate-600">{order.bodyPartRequested}</p>
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-36">
											{onViewImages &&
												(order.status === 'completed' ||
													order.status?.toLowerCase() === 'completed') && (
													<>
														<DropdownMenuItem
															onClick={() => onViewImages(order)}
															className="cursor-pointer text-sm"
														>
															<Eye className="mr-2 h-3 w-3" />
															Xem hình ảnh
														</DropdownMenuItem>
														<DropdownMenuSeparator />
													</>
												)}
											<DropdownMenuItem
												onClick={() => onEditOrder(order)}
												className="cursor-pointer text-sm"
											>
												<Pencil className="mr-2 h-3 w-3" />
												Sửa
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => onDeleteOrder(order)}
												className="cursor-pointer text-sm text-red-600"
											>
												<Trash2 className="mr-2 h-3 w-3" />
												Xóa
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								{order.reasonForStudy && (
									<p className="text-xs text-slate-600 mb-3 line-clamp-2 pl-12">
										{order.reasonForStudy}
									</p>
								)}
								<div className="flex items-center justify-between pl-12">
									{getStatusBadge(order.status)}
									<p className="text-xs text-slate-400">
										{new Date(order.createdAt).toLocaleTimeString('vi-VN', {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
