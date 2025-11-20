import Link from 'next/link';
import { ArrowLeft, Shield, Calendar, Lock, Eye, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata = {
	title: 'Chính Sách Bảo Mật - AIDIMS',
	description: 'Chính sách bảo mật và quyền riêng tư của hệ thống quản lý hình ảnh y tế AIDIMS',
};

export default function PrivacyPage() {
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
								<Shield className="h-5 w-5 text-primary" />
								<h1 className="text-xl font-semibold">Chính Sách Bảo Mật</h1>
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
								<Shield className="h-6 w-6 text-primary" />
							</div>
							<div className="flex-1">
								<CardTitle className="text-2xl mb-2">
									Chính Sách Bảo Mật và Quyền Riêng Tư
								</CardTitle>
								<CardDescription className="text-base">
									AIDIMS cam kết bảo vệ quyền riêng tư và bảo mật thông tin của bạn
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

				{/* Privacy Content */}
				<div className="space-y-6">
					{/* Section 1 */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Eye className="h-5 w-5 text-primary" />
								<CardTitle className="text-xl">1. Thông Tin Chúng Tôi Thu Thập</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<div>
								<h4 className="font-semibold text-foreground mb-2">1.1. Thông Tin Người Dùng</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Họ tên, email, số điện thoại</li>
									<li>Vai trò và chức danh trong hệ thống</li>
									<li>Thông tin đăng nhập và mật khẩu (đã mã hóa)</li>
									<li>Địa chỉ IP và thông tin thiết bị truy cập</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">1.2. Thông Tin Bệnh Nhân</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Thông tin nhân khẩu học (họ tên, ngày sinh, giới tính, địa chỉ)</li>
									<li>Mã bệnh nhân và số hồ sơ y tế</li>
									<li>Thông tin liên hệ khẩn cấp</li>
									<li>Lịch sử khám chữa bệnh</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">1.3. Dữ Liệu Y Tế</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Hình ảnh DICOM (X-quang, CT, MRI, v.v.)</li>
									<li>Metadata của hình ảnh y tế</li>
									<li>Kết quả phân tích và chẩn đoán</li>
									<li>Báo cáo y tế và ghi chú của bác sĩ</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">1.4. Dữ Liệu Hệ Thống</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Log truy cập và hoạt động</li>
									<li>Thời gian và tần suất sử dụng</li>
									<li>Lỗi và sự cố hệ thống</li>
									<li>Dữ liệu hiệu suất và sử dụng</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Section 2 */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Database className="h-5 w-5 text-primary" />
								<CardTitle className="text-xl">2. Cách Chúng Tôi Sử Dụng Thông Tin</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:</p>
							<div>
								<h4 className="font-semibold text-foreground mb-2">2.1. Cung Cấp Dịch Vụ</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Quản lý và lưu trữ hình ảnh y tế</li>
									<li>Phân tích hình ảnh bằng AI</li>
									<li>Hỗ trợ chẩn đoán và ra quyết định lâm sàng</li>
									<li>Tạo báo cáo và thống kê</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">2.2. Cải Thiện Dịch Vụ</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Phân tích hiệu suất hệ thống</li>
									<li>Cải tiến thuật toán AI (với dữ liệu đã ẩn danh)</li>
									<li>Phát triển tính năng mới</li>
									<li>Khắc phục lỗi và tối ưu hóa</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">2.3. Bảo Mật và Tuân Thủ</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Xác thực và ủy quyền người dùng</li>
									<li>Phát hiện và ngăn chặn vi phạm</li>
									<li>Tuân thủ quy định pháp luật</li>
									<li>Audit và kiểm toán</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Section 3 */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Lock className="h-5 w-5 text-primary" />
								<CardTitle className="text-xl">3. Bảo Mật Thông Tin</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
								<p className="font-semibold text-primary mb-2">🔒 Cam Kết Bảo Mật</p>
								<p className="text-sm">
									Chúng tôi áp dụng các biện pháp bảo mật tiên tiến nhất để bảo vệ thông tin của bạn
									khỏi truy cập trái phép, mất mát hoặc tiết lộ.
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">3.1. Biện Pháp Kỹ Thuật</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>
										<strong>Mã hóa:</strong> SSL/TLS cho truyền tải, AES-256 cho lưu trữ
									</li>
									<li>
										<strong>Xác thực:</strong> Multi-factor authentication (MFA)
									</li>
									<li>
										<strong>Kiểm soát truy cập:</strong> Role-Based Access Control (RBAC)
									</li>
									<li>
										<strong>Firewall:</strong> Bảo vệ mạng và ứng dụng
									</li>
									<li>
										<strong>Giám sát:</strong> Hệ thống phát hiện xâm nhập (IDS/IPS)
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">3.2. Biện Pháp Quản Lý</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Chính sách bảo mật nghiêm ngặt</li>
									<li>Đào tạo nhân viên về bảo mật</li>
									<li>Kiểm toán bảo mật định kỳ</li>
									<li>Kế hoạch ứng phó sự cố</li>
									<li>Giới hạn quyền truy cập theo nguyên tắc cần biết</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">3.3. Tuân Thủ Tiêu Chuẩn</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>
										<strong>HIPAA:</strong> Health Insurance Portability and Accountability Act
									</li>
									<li>
										<strong>GDPR:</strong> General Data Protection Regulation (nếu áp dụng)
									</li>
									<li>
										<strong>DICOM:</strong> Tiêu chuẩn hình ảnh y tế
									</li>
									<li>
										<strong>ISO 27001:</strong> Quản lý bảo mật thông tin
									</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Section 4 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">4. Chia Sẻ Thông Tin</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
								<p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
									⚠️ Nguyên Tắc Không Chia Sẻ
								</p>
								<p className="text-sm">
									Chúng tôi KHÔNG bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn với bên thứ
									ba cho mục đích thương mại.
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">
									4.1. Các Trường Hợp Được Phép
								</h4>
								<p>Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:</p>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>
										<strong>Với sự đồng ý:</strong> Khi bạn cho phép rõ ràng
									</li>
									<li>
										<strong>Chuyển viện:</strong> Khi bệnh nhân được chuyển đến cơ sở khác
									</li>
									<li>
										<strong>Yêu cầu pháp lý:</strong> Khi pháp luật yêu cầu
									</li>
									<li>
										<strong>Bảo vệ quyền lợi:</strong> Để bảo vệ sức khỏe và an toàn
									</li>
									<li>
										<strong>Nghiên cứu:</strong> Dữ liệu đã ẩn danh cho nghiên cứu khoa học
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">4.2. Nhà Cung Cấp Dịch Vụ</h4>
								<p>Chúng tôi có thể sử dụng các nhà cung cấp dịch vụ đáng tin cậy cho:</p>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Lưu trữ đám mây (cloud storage)</li>
									<li>Phân tích dữ liệu</li>
									<li>Bảo trì hệ thống</li>
									<li>Hỗ trợ kỹ thuật</li>
								</ul>
								<p className="text-sm italic mt-2">
									Tất cả nhà cung cấp đều phải ký thỏa thuận bảo mật và tuân thủ nghiêm ngặt.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Section 5 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">5. Quyền Của Bạn</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
							<div className="grid md:grid-cols-2 gap-4">
								<div className="bg-muted/50 rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-2">✓ Quyền Truy Cập</h4>
									<p className="text-sm">Yêu cầu xem thông tin chúng tôi lưu trữ về bạn</p>
								</div>
								<div className="bg-muted/50 rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-2">✓ Quyền Chỉnh Sửa</h4>
									<p className="text-sm">Yêu cầu sửa thông tin không chính xác</p>
								</div>
								<div className="bg-muted/50 rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-2">✓ Quyền Xóa</h4>
									<p className="text-sm">Yêu cầu xóa thông tin cá nhân (có điều kiện)</p>
								</div>
								<div className="bg-muted/50 rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-2">✓ Quyền Hạn Chế</h4>
									<p className="text-sm">Hạn chế cách chúng tôi xử lý thông tin</p>
								</div>
								<div className="bg-muted/50 rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-2">✓ Quyền Xuất Dữ Liệu</h4>
									<p className="text-sm">Nhận bản sao dữ liệu ở định dạng có cấu trúc</p>
								</div>
								<div className="bg-muted/50 rounded-lg p-4">
									<h4 className="font-semibold text-foreground mb-2">✓ Quyền Phản Đối</h4>
									<p className="text-sm">Phản đối việc xử lý dữ liệu cho mục đích cụ thể</p>
								</div>
							</div>
							<div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
								<p className="text-sm">
									<strong className="text-foreground">Lưu ý:</strong> Một số quyền có thể bị giới
									hạn bởi nghĩa vụ pháp lý hoặc yêu cầu lưu trữ hồ sơ y tế.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Section 6 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">6. Lưu Trữ Dữ Liệu</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<div>
								<h4 className="font-semibold text-foreground mb-2">6.1. Thời Gian Lưu Trữ</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>
										<strong>Hồ sơ y tế:</strong> Theo quy định pháp luật (thường 10-20 năm)
									</li>
									<li>
										<strong>Hình ảnh DICOM:</strong> Lưu trữ lâu dài cho mục đích y tế
									</li>
									<li>
										<strong>Log hệ thống:</strong> 12-24 tháng
									</li>
									<li>
										<strong>Dữ liệu tạm:</strong> Xóa định kỳ theo chính sách
									</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">6.2. Vị Trí Lưu Trữ</h4>
								<ul className="list-disc list-inside space-y-1 ml-4">
									<li>Máy chủ bảo mật tại [Vị trí data center]</li>
									<li>Sao lưu định kỳ tại nhiều vị trí địa lý</li>
									<li>Tuân thủ quy định về lưu trữ dữ liệu y tế</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-foreground mb-2">6.3. Xóa Dữ Liệu</h4>
								<p>
									Khi dữ liệu không còn cần thiết hoặc theo yêu cầu, chúng tôi sẽ xóa an toàn bằng
									các phương pháp không thể khôi phục.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Section 7 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">7. Cookies và Công Nghệ Theo Dõi</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>Chúng tôi sử dụng cookies và công nghệ tương tự để:</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Duy trì phiên đăng nhập</li>
								<li>Ghi nhớ tùy chọn của bạn</li>
								<li>Phân tích cách sử dụng hệ thống</li>
								<li>Cải thiện trải nghiệm người dùng</li>
							</ul>
							<div className="bg-muted/50 rounded-lg p-4 mt-4">
								<h4 className="font-semibold text-foreground mb-2">Các Loại Cookies</h4>
								<ul className="list-disc list-inside space-y-1 ml-4 text-sm">
									<li>
										<strong>Essential:</strong> Cần thiết cho hoạt động của hệ thống
									</li>
									<li>
										<strong>Functional:</strong> Lưu tùy chọn và cài đặt
									</li>
									<li>
										<strong>Analytics:</strong> Thu thập dữ liệu sử dụng ẩn danh
									</li>
								</ul>
							</div>
							<p className="text-sm">
								Bạn có thể quản lý cookies qua cài đặt trình duyệt, nhưng một số tính năng có thể
								không hoạt động nếu cookies bị vô hiệu hóa.
							</p>
						</CardContent>
					</Card>

					{/* Section 8 */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<AlertTriangle className="h-5 w-5 text-yellow-600" />
								<CardTitle className="text-xl">8. Vi Phạm Dữ Liệu</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Trong trường hợp xảy ra vi phạm dữ liệu có thể ảnh hưởng đến quyền riêng tư của bạn:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Chúng tôi sẽ thông báo cho bạn trong vòng 72 giờ</li>
								<li>Mô tả bản chất của vi phạm</li>
								<li>Đánh giá tác động có thể xảy ra</li>
								<li>Các biện pháp khắc phục đã và sẽ thực hiện</li>
								<li>Hướng dẫn bạn cách bảo vệ bản thân</li>
							</ul>
							<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
								<p className="text-sm">
									<strong className="text-red-600 dark:text-red-400">Cam kết:</strong> Chúng tôi sẽ
									làm mọi thứ có thể để ngăn chặn vi phạm và giảm thiểu tác động nếu xảy ra.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Section 9 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">9. Quyền Riêng Tư Của Trẻ Em</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Hệ thống AIDIMS không nhắm đến người dùng dưới 18 tuổi để sử dụng độc lập. Thông tin
								của bệnh nhân nhi khoa phải được quản lý bởi người giám hộ hợp pháp hoặc nhân viên y
								tế được ủy quyền.
							</p>
							<p>
								Nếu chúng tôi phát hiện thông tin của trẻ em được thu thập không đúng quy định,
								chúng tôi sẽ xóa thông tin đó ngay lập tức.
							</p>
						</CardContent>
					</Card>

					{/* Section 10 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">10. Thay Đổi Chính Sách</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi quan
								trọng sẽ được thông báo qua:
							</p>
							<ul className="list-disc list-inside space-y-1 ml-4">
								<li>Thông báo trong hệ thống</li>
								<li>Email đến địa chỉ đã đăng ký</li>
								<li>Banner trên trang chủ</li>
							</ul>
							<p>
								Chúng tôi khuyến khích bạn xem lại chính sách này định kỳ để cập nhật các thay đổi
								mới nhất.
							</p>
						</CardContent>
					</Card>

					{/* Section 11 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">11. Liên Hệ về Quyền Riêng Tư</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc muốn thực hiện các
								quyền của mình, vui lòng liên hệ:
							</p>
							<div className="bg-muted/50 rounded-lg p-4 space-y-3">
								<div>
									<strong className="text-foreground">Trưởng Phòng Bảo Vệ Dữ Liệu (DPO)</strong>
								</div>
								<Separator />
								<div className="space-y-2">
									<p>
										<strong className="text-foreground">Email:</strong> privacy@aidims.com
									</p>
									<p>
										<strong className="text-foreground">Email (Khẩn cấp):</strong>{' '}
										security@aidims.com
									</p>
									<p>
										<strong className="text-foreground">Điện thoại:</strong> +84 (0) 123 456 789
									</p>
									<p>
										<strong className="text-foreground">Địa chỉ:</strong> [Địa chỉ văn phòng]
									</p>
								</div>
								<Separator />
								<p className="text-sm">
									<strong className="text-foreground">Thời gian phản hồi:</strong> Chúng tôi cam kết
									phản hồi yêu cầu của bạn trong vòng 30 ngày.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Section 12 */}
					<Card>
						<CardHeader>
							<CardTitle className="text-xl">12. Khiếu Nại</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-muted-foreground">
							<p>
								Nếu bạn không hài lòng với cách chúng tôi xử lý thông tin của mình, bạn có quyền
								khiếu nại với:
							</p>
							<ul className="list-disc list-inside space-y-2 ml-4">
								<li>Cơ quan bảo vệ dữ liệu địa phương</li>
								<li>Bộ Y tế hoặc cơ quan quản lý y tế</li>
								<li>Cơ quan pháp lý có thẩm quyền</li>
							</ul>
							<p className="text-sm italic border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r">
								Tuy nhiên, chúng tôi khuyến khích bạn liên hệ với chúng tôi trước để chúng tôi có cơ
								hội giải quyết vấn đề của bạn.
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Footer Actions */}
				<div className="mt-8 pt-6 border-t">
					<div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
						<p className="text-sm text-muted-foreground">
							Bảo mật của bạn là ưu tiên hàng đầu của chúng tôi.
						</p>
						<div className="flex gap-3">
							<Button asChild variant="outline">
								<Link href="/terms">Điều Khoản Sử Dụng</Link>
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
