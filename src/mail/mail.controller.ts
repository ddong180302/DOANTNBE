import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Get } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailService } from './mail.service';
import { SubscriberDocument } from 'src/subscribers/schemas/subscriber.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber } from 'rxjs';

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
    @Get()
    @Public()
    @ResponseMessage("Test email")
    async handleTestEmail() {
        const subscribers = await this.subscriberModel.find({});
        for (const subs of subscribers) {
            const subsSkills = subs.skills;
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
                    to: "nguyenvancong.35tk@gmail.com",
                    from: '"Support Team" <support@example.com>', // override default from
                    subject: 'Welcome to Nice App! Confirm your Email',
                    template: "new-job", // HTML body content
                    context: {
                        receiver: subs.name,
                        jobs: jobs
                    }
                });
            }
        }


    }
}



