from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone

from todos.models import Todo


class Command(BaseCommand):
    help = "Send email reminders to each user about TODOs due today."

    def add_arguments(self, parser):
        parser.add_argument(
            "--date",
            help="Override the target date (YYYY-MM-DD). Defaults to local today.",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        date_str = options.get("date")
        if date_str:
            today = timezone.datetime.fromisoformat(date_str).date()
        else:
            today = timezone.localdate()

        users = User.objects.all()
        if not users.exists():
            self.stdout.write(self.style.WARNING("No users found."))
            return

        sent_any = False
        for user in users:
            if not user.email:
                continue

            todos = (
                Todo.objects.filter(user=user, due_date=today, completed=False)
                .order_by("due_date", "id")
                .select_related("user")
            )
            if not todos.exists():
                continue

            lines = [f"- {t.title} (due {t.due_date.isoformat()})" for t in todos]
            body = (
                "Good morning!\n\n"
                "Here are your TODOs due today:\n"
                + "\n".join(lines)
                + "\n\n"
                "Have a great day!"
            )

            send_mail(
                subject="Your TODOs for today",
                message=body,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                recipient_list=[user.email],
                fail_silently=False,
            )
            sent_any = True

        if sent_any:
            self.stdout.write(self.style.SUCCESS("Daily reminders sent."))
        else:
            self.stdout.write(self.style.WARNING("No reminders to send for this date."))

