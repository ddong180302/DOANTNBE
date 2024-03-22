import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Get } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailService } from './mail.service';
import { SubscriberDocument, Subscriber } from 'src/subscribers/schemas/subscriber.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
    constructor(
        private readonly mailService: MailService,
        private mailerService: MailerService,
        @InjectModel(Subscriber.name)
        private subscriberModel: SoftDeleteModel<SubscriberDocument>,
        @InjectModel(Job.name)
        private jobModel: SoftDeleteModel<JobDocument>
    ) { }

    // @Cron(CronExpression.EVERY_30_SECONDS)
    //@Cron("0 0 0 * * 0")
    //@Cron(CronExpression.EVERY_0_MINUTES)
    //@Cron(CronExpression.EVERY_30_SECONDS)
    //@Cron("0 0 */1 * * *") // Chạy hàm mỗi 60 phút


    @Get()
    @Public()
    @Cron("0 0 0 * * 0")
    @ResponseMessage("Test email")
    async handleSendEmail() {
        const subscribers = await this.subscriberModel.find({});
        for (const subscriber of subscribers) {
            const subsSkills = subscriber.skills;
            const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
            if (jobWithMatchingSkills?.length) {
                const jobs = jobWithMatchingSkills.map(item => {
                    return {
                        name: item.name,
                        company: item.company.name,
                        salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ",
                        skills: item.skills
                    }
                })
                await this.mailerService.sendMail({
                    to: subscriber.email, // Gửi email đến địa chỉ email của subscriber hiện tại
                    from: '"Nice App" <support@example.com>', // override default from
                    subject: 'Welcome to Nice App! Confirm your Email',
                    template: "new-job", // HTML body content
                    context: {
                        receiver: subscriber.name,
                        jobs: jobs
                    }
                });
            }
        }
    }

    sendEmailByCreate = async (email: string, confirmationCode: string) => {
        try {
            await this.mailerService.sendMail({
                to: email,
                from: '"Nice App" <support@example.com>',
                subject: 'Welcome to Nice App! Confirm your Email',
                template: "new-job",
                context: {
                    receiver: email, // Gửi đến địa chỉ email của người dùng mới
                    confirmationCode: confirmationCode // Mã code xác nhận
                }
            });
            console.log('Email sent successfully.');
        } catch (error) {
            console.error('Error sending email:', error);
            // Xử lý lỗi nếu có
        }
    }
}