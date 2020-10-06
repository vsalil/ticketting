import { Subjects, ExpirationCompleteEvent, Publisher} from '@svpillai/common'

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompleteEvent>{
subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}