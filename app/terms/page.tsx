import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata = {
	title: 'Điều Khoản Sử Dụng - AIDIMS',
	description: 'Điều khoản và điều kiện sử dụng hệ thống quản lý hình ảnh y tế AIDIMS',
};

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-linear-to-br from-background via-background to-muted">
			{/* Header */}
			<div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button asChild variant="ghost" size="sm">
								<Link href="/dashboard">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Quay Lại
								</Link>
							</Button>
							<Separator orientation="vertical" className="h-6" />
							<div className="flex items-center gap-2">
								<Scale className="h-5 w-5 text-primary" />
								<h1 className="text-xl font-semibold">Điều Khoản Sử Dụng</h1>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Intro Card */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-start gap-4">
							<div className="p-3 bg-primary/10 rounded-lg">
								<FileText className="h-6 w-6 text-primary" />
							</div>
							<div className="flex-1">
								<CardTitle className="text-2xl mb-2">Điều Khoản Sử Dụng Dịch Vụ</CardTitle>
								<CardDescription className="text-base">
									Vui lòng đọc kỹ các điều khoản và điều kiện trước khi sử dụng hệ thống AIDIMS
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>Cập nhật lần cuối: 13 tháng 11, 2025</span>
						</div>
					</CardContent>
				</Card>

				{/* Terms Content */}
				<div className="space-y-6">
					{/* Section 1 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">1. Chấp Nhận Điều Khoản</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Bằng việc truy cập và sử dụng hệ thống AIDIMS (AI-powered Diagnostic Imaging
								Management System), bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều
								kiện sau đây.
							</p>
							<p>
								Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử
								dụng dịch vụ của chúng tôi.
							</p>
						</CardContent>
					</Card>

					{/* Section 2 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">2. Mô Tả Dịch Vụ</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								AIDIMS là một hệ thống quản lý hình ảnh chẩn đoán y tế được hỗ trợ bởi trí tuệ nhân
								tạo, cung cấp các tính năng:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Quản lý và lưu trữ hình ảnh DICOM</li>
								<li>Quản lý hồ sơ bệnh nhân</li>
								<li>Phân tích hình ảnh y tế bằng AI</li>
								<li>Hỗ trợ chẩn đoán và báo cáo</li>
								<li>Quản lý người dùng và phân quyền</li>
							</ul>
						</CardContent>
					</Card>

					{/* Section 3 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">3. Tài Khoản Người Dùng</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<div>
								<h4 className="font-semibold text-foreground mb-2">3.1. Đăng Ký Tài Khoản</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
									<li>Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản</li>
									<li>Bạn phải thông báo ngay lập tức về bất kỳ vi phạm bảo mật nào</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">3.2. Quyền Hạn Người Dùng</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Admin: Toàn quyền quản lý hệ thống</li>
									<li>Doctor: Xem và chẩn đoán hình ảnh, quản lý bệnh nhân</li>
									<li>Nurse: Hỗ trợ quản lý thông tin bệnh nhân</li>
									<li>Staff: Truy cập hạn chế theo phân quyền</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Section 4 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">4. Quyền và Trách Nhiệm</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<div>
								<h4 className="font-semibold text-foreground mb-2">4.1. Quyền Của Người Dùng</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Truy cập và sử dụng các tính năng theo quyền hạn được cấp</li>
									<li>Yêu cầu hỗ trợ kỹ thuật và đào tạo</li>
									<li>Đề xuất cải tiến và phản hồi về dịch vụ</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">
									4.2. Trách Nhiệm Của Người Dùng
								</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Tuân thủ các quy định về bảo mật thông tin y tế</li>
									<li>Sử dụng hệ thống đúng mục đích chuyên môn y tế</li>
									<li>Không chia sẻ thông tin đăng nhập với người khác</li>
									<li>Báo cáo ngay lập tức bất kỳ sự cố bảo mật nào</li>
									<li>Chịu trách nhiệm về các quyết định y tế dựa trên kết quả AI</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Section 5 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">5. Bảo Mật Thông Tin</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>Hệ thống AIDIMS tuân thủ các tiêu chuẩn bảo mật thông tin y tế quốc tế:</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Mã hóa dữ liệu end-to-end</li>
								<li>Tuân thủ HIPAA và GDPR (nếu áp dụng)</li>
								<li>Kiểm soát truy cập dựa trên vai trò (RBAC)</li>
								<li>Ghi log và audit trail đầy đủ</li>
								<li>Sao lưu dữ liệu định kỳ và an toàn</li>
							</ul>
							<p className="text-sm italic border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r">
								<strong>Lưu ý:</strong> Người dùng có trách nhiệm bảo vệ thông tin đăng nhập và
								không chia sẻ với bất kỳ ai.
							</p>
						</CardContent>
					</Card>

					{/* Section 6 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">6. Sử Dụng AI và Trách Nhiệm Y Khoa</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
								<p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
									⚠️ Tuyên Bố Quan Trọng
								</p>
								<p className="text-sm">
									Kết quả phân tích từ AI chỉ mang tính chất tham khảo và hỗ trợ. Bác sĩ và chuyên
									gia y tế phải tự đưa ra quyết định chẩn đoán và điều trị dựa trên đánh giá lâm
									sàng toàn diện.
								</p>
							</div>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>AI không thay thế chẩn đoán của bác sĩ</li>
								<li>Kết quả AI cần được xác nhận bởi chuyên gia</li>
								<li>Người dùng chịu trách nhiệm về các quyết định y tế cuối cùng</li>
								<li>Hệ thống không chịu trách nhiệm về các quyết định điều trị</li>
							</ul>
						</CardContent>
					</Card>

					{/* Section 7 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">7. Hành Vi Bị Cấm</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>Người dùng không được phép:</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Sử dụng hệ thống cho mục đích bất hợp pháp</li>
								<li>Cố gắng truy cập trái phép vào hệ thống</li>
								<li>Sao chép, phân phối hoặc sửa đổi phần mềm</li>
								<li>Tải lên nội dung độc hại hoặc vi-rút</li>
								<li>Can thiệp vào hoạt động của hệ thống</li>
								<li>Chia sẻ thông tin bệnh nhân trái phép</li>
								<li>Sử dụng dữ liệu cho mục đích thương mại không được phép</li>
							</ul>
						</CardContent>
					</Card>

					{/* Section 8 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">8. Quyền Sở Hữu Trí Tuệ</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Tất cả quyền sở hữu trí tuệ liên quan đến AIDIMS, bao gồm nhưng không giới hạn ở
								phần mềm, mã nguồn, thuật toán AI, giao diện người dùng, và tài liệu, đều thuộc về
								chủ sở hữu hệ thống.
							</p>
							<p>
								Dữ liệu bệnh nhân và hình ảnh y tế được tải lên hệ thống vẫn thuộc quyền sở hữu của
								cơ sở y tế hoặc bệnh nhân tương ứng.
							</p>
						</CardContent>
					</Card>

					{/* Section 9 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">9. Giới Hạn Trách Nhiệm</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Trong phạm vi tối đa được pháp luật cho phép, AIDIMS không chịu trách nhiệm cho:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Mọi thiệt hại trực tiếp, gián tiếp, ngẫu nhiên hoặc hệ quả</li>
								<li>Mất mát dữ liệu do sự cố kỹ thuật không lường trước</li>
								<li>Gián đoạn dịch vụ do bảo trì hoặc cập nhật</li>
								<li>Quyết định y tế dựa trên kết quả từ hệ thống</li>
								<li>Lỗi hoặc thiếu sót trong dữ liệu do người dùng nhập</li>
							</ul>
						</CardContent>
					</Card>

					{/* Section 10 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">10. Chấm Dứt Dịch Vụ</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Chúng tôi có quyền đình chỉ hoặc chấm dứt quyền truy cập của bạn vào hệ thống nếu
								phát hiện vi phạm điều khoản sử dụng, mà không cần thông báo trước.
							</p>
							<p>Người dùng có thể yêu cầu xuất dữ liệu trước khi chấm dứt sử dụng dịch vụ.</p>
						</CardContent>
					</Card>

					{/* Section 11 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">11. Thay Đổi Điều Khoản</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có
								hiệu lực ngay khi được đăng tải trên hệ thống.
							</p>
							<p>
								Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp
								nhận các điều khoản mới.
							</p>
						</CardContent>
					</Card>

					{/* Section 12 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">12. Liên Hệ</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ:</p>
							<div className="bg-muted/50 rounded-lg p-4 space-y-2">
								<p>
									<strong className="text-foreground">Email:</strong> support@aidims.com
								</p>
								<p>
									<strong className="text-foreground">Điện thoại:</strong> +84 (0) 123 456 789
								</p>
								<p>
									<strong className="text-foreground">Địa chỉ:</strong> [Địa chỉ văn phòng]
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Footer Actions */}
				<div className="mt-8 pt-6 border-t">
					<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
						<p className="text-sm text-muted-foreground">
							Bằng việc sử dụng AIDIMS, bạn đồng ý với các điều khoản trên.
						</p>
						<div className="flex gap-3">
							<Button asChild variant="outline">
								<Link href="/privacy">Chính Sách Bảo Mật</Link>
							</Button>
							<Button asChild>
								<Link href="/dashboard">Quay Về Dashboard</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
