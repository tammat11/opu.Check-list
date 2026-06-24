from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models import (
    ActiveChecklist,
    BrowserFingerprint,
    ChecklistAssignment,
    ChecklistProgress,
    ChecklistTemplate,
    Notification,
    Object,
    PersonalChecklistItem,
    ShiftSession,
    TemplateItem,
    User,
)


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    admin = User(
        phone="+7 700 000 00 01",
        iin="111111111111",
        name="Админ Алина",
        role="admin",
        password_hash=get_password_hash("admin123"),
    )
    partner = User(
        phone="+7 700 000 00 02",
        iin="222222222222",
        name="Партнер Айгерим",
        role="partner",
        password_hash=get_password_hash("partner123"),
    )
    curator = User(
        phone="+7 700 000 00 03",
        iin="333333333333",
        name="Куратор Алибек",
        role="curator",
        parent=partner,
        password_hash=get_password_hash("curator123"),
    )
    cleaner = User(
        phone="+7 700 000 00 04",
        iin="444444444444",
        name="Клинер Дана",
        role="cleaner",
        parent=curator,
        password_hash=get_password_hash("cleaner123"),
    )
    cleaner2 = User(
        phone="+7 700 000 00 05",
        iin="555555555555",
        name="Клинер Ерлан",
        role="cleaner",
        parent=curator,
        password_hash=get_password_hash("cleaner234"),
    )
    cleaner3 = User(
        phone="+7 700 000 00 06",
        iin="666666666666",
        name="Клинер Зарина",
        role="cleaner",
        parent=curator,
        password_hash=get_password_hash("cleaner345"),
    )
    db.add_all([admin, partner, curator, cleaner, cleaner2, cleaner3])
    db.flush()

    objects = [
        Object(
            name="ул. Абая 12",
            address="ул. Абая 12",
            city="Алматы",
            district="Алмалинский район",
            latitude=43.2550,
            longitude=76.9126,
            workers_count=2,
            partner_id=partner.id,
            curator_id=curator.id,
            created_by=admin.id,
        ),
        Object(
            name="пр. Достык 89",
            address="пр. Достык 89",
            city="Алматы",
            district="Медеуский район",
            latitude=43.2415,
            longitude=76.9554,
            workers_count=3,
            partner_id=partner.id,
            curator_id=curator.id,
            created_by=admin.id,
        ),
        Object(
            name="ул. Толе би 55",
            address="ул. Толе би 55",
            city="Алматы",
            district="Бостандыкский район",
            latitude=43.2680,
            longitude=76.8930,
            workers_count=1,
            partner_id=partner.id,
            curator_id=curator.id,
            created_by=admin.id,
        ),
        Object(
            name="пр. Аль-Фараби 17",
            address="пр. Аль-Фараби 17",
            city="Алматы",
            district="Бостандыкский район",
            latitude=43.2174,
            longitude=76.8690,
            workers_count=2,
            partner_id=partner.id,
            curator_id=curator.id,
            created_by=admin.id,
        ),
        Object(
            name="ул. Байзакова 280",
            address="ул. Байзакова 280",
            city="Алматы",
            district="Алматинский район",
            latitude=43.2760,
            longitude=76.9310,
            workers_count=1,
            partner_id=partner.id,
            curator_id=curator.id,
            created_by=admin.id,
        ),
    ]
    db.add_all(objects)
    db.flush()

    templates = [
        ChecklistTemplate(
            name="Чек-лист 1",
            description="Санузлы и базовая гигиена",
            created_by=admin.id,
        ),
        ChecklistTemplate(
            name="Чек-лист 2",
            description="Зал и офисная зона",
            created_by=admin.id,
        ),
        ChecklistTemplate(
            name="Чек-лист 3",
            description="Коридоры и кухня",
            created_by=admin.id,
        ),
    ]
    db.add_all(templates)
    db.flush()

    template_items = [
        (templates[0], [
            ("Помыть унитазы", "Санузлы", "toilet", 10),
            ("Протереть раковины", "Санузлы", "sink", 5),
            ("Помыть полы", "Санузлы", "mop", 10),
            ("Заменить мыло", "Санузлы", "soap", 3),
            ("Протереть зеркала", "Санузлы", "mirror", 5),
            ("Очистить корзины", "Санузлы", "trash_bin", 3),
        ]),
        (templates[1], [
            ("Пропылесосить / подмести", "Зал / Офис", "vacuum", 15),
            ("Протереть столы и стулья", "Зал / Офис", "table", 10),
            ("Вынести мусор", "Зал / Офис", "trash_bin", 5),
            ("Протереть подоконники", "Зал / Офис", "window", 5),
            ("Помыть полы", "Зал / Офис", "mop", 15),
        ]),
        (templates[2], [
            ("Подмести коридор", "Коридоры", "broom", 5),
            ("Протереть перила", "Коридоры", "brush", 5),
            ("Вымыть пол", "Коридоры", "bucket", 10),
            ("Убрать обувь и вещи", "Коридоры", "door", 5),
            ("Помыть раковину", "Кухня", "sink", 5),
            ("Протереть столешницы", "Кухня", "sponge", 5),
            ("Вынести мусор", "Кухня", "trash_bin", 3),
            ("Протереть микроволновку", "Кухня", "microwave", 5),
        ]),
    ]

    for template, items in template_items:
        for index, (title, zone, icon, duration) in enumerate(items):
            db.add(
                TemplateItem(
                    template_id=template.id,
                    title=title,
                    zone=zone,
                    icon=icon,
                    duration_minutes=duration,
                    order_index=index,
                )
            )
    db.flush()

    assignments = [
        ChecklistAssignment(template_id=templates[0].id, object_id=objects[0].id, assigned_by=admin.id, is_default=False),
        ChecklistAssignment(template_id=templates[1].id, object_id=objects[1].id, assigned_by=admin.id, is_default=False),
        ChecklistAssignment(template_id=templates[2].id, object_id=objects[2].id, assigned_by=admin.id, is_default=False),
        ChecklistAssignment(template_id=templates[2].id, object_id=objects[3].id, assigned_by=admin.id, is_default=False),
        ChecklistAssignment(template_id=templates[2].id, object_id=objects[4].id, assigned_by=admin.id, is_default=False),
    ]
    db.add_all(assignments)
    db.flush()

    active_rows = [
        ActiveChecklist(
            template_id=templates[0].id,
            object_id=objects[0].id,
            assigned_to=cleaner.id,
            assigned_by=curator.id,
            due_date=datetime.utcnow() + timedelta(hours=2),
            shift_date=datetime.utcnow().date(),
            status="in_progress",
            started_at=datetime.utcnow() - timedelta(minutes=35),
        ),
        ActiveChecklist(
            template_id=templates[1].id,
            object_id=objects[1].id,
            assigned_to=cleaner2.id,
            assigned_by=curator.id,
            due_date=datetime.utcnow() + timedelta(hours=3),
            shift_date=datetime.utcnow().date(),
            status="pending",
        ),
        ActiveChecklist(
            template_id=templates[2].id,
            object_id=objects[3].id,
            assigned_to=cleaner3.id,
            assigned_by=curator.id,
            due_date=datetime.utcnow() + timedelta(hours=4),
            shift_date=datetime.utcnow().date(),
            status="completed",
            started_at=datetime.utcnow() - timedelta(hours=2),
            completed_at=datetime.utcnow() - timedelta(minutes=25),
        ),
    ]
    db.add_all(active_rows)
    db.flush()

    template_one_items = db.query(TemplateItem).filter(TemplateItem.template_id == templates[0].id).order_by(TemplateItem.order_index.asc()).all()
    for item in template_one_items[:4]:
        db.add(
            ChecklistProgress(
                checklist_id=active_rows[0].id,
                item_id=item.id,
                completed=True,
                completed_at=datetime.utcnow() - timedelta(minutes=10),
            )
        )

    template_three_items = db.query(TemplateItem).filter(TemplateItem.template_id == templates[2].id).order_by(TemplateItem.order_index.asc()).all()
    for item in template_three_items:
        db.add(
            ChecklistProgress(
                checklist_id=active_rows[2].id,
                item_id=item.id,
                completed=True,
                completed_at=datetime.utcnow() - timedelta(minutes=30),
            )
        )

    db.add_all(
        [
            ShiftSession(
                user_id=cleaner.id,
                object_id=objects[0].id,
                active_checklist_id=active_rows[0].id,
                status="active",
                start_time=datetime.utcnow() - timedelta(minutes=35),
            ),
            ShiftSession(
                user_id=cleaner2.id,
                object_id=objects[1].id,
                active_checklist_id=active_rows[1].id,
                status="planned",
            ),
            ShiftSession(
                user_id=cleaner3.id,
                object_id=objects[3].id,
                active_checklist_id=active_rows[2].id,
                status="completed",
                start_time=datetime.utcnow() - timedelta(hours=2),
                end_time=datetime.utcnow() - timedelta(minutes=25),
            ),
        ]
    )

    db.add_all(
        [
            PersonalChecklistItem(user_id=cleaner.id, title="Пропылесосить полы", sort_order=1),
            PersonalChecklistItem(user_id=cleaner.id, title="Протереть поверхности", sort_order=2),
            PersonalChecklistItem(user_id=cleaner.id, title="Проверить кухонную зону", sort_order=3),
            PersonalChecklistItem(user_id=cleaner.id, title="Подготовить фотоотчет", sort_order=4),
        ]
    )

    db.add_all(
        [
            Notification(
                user_id=cleaner.id,
                checklist_id=active_rows[0].id,
                title="Новая смена",
                message="Проверьте назначенный чек-лист на объекте ул. Абая 12",
                notification_type="assignment",
                sent=True,
                sent_at=datetime.utcnow() - timedelta(minutes=40),
                metadata_json={"seed": True},
            ),
            Notification(
                user_id=curator.id,
                title="Сводка по объектам",
                message="На одном объекте осталось завершить часть задач",
                notification_type="summary",
                sent=True,
                sent_at=datetime.utcnow() - timedelta(minutes=20),
                metadata_json={"seed": True},
            ),
        ]
    )

    db.add(
        BrowserFingerprint(
            user_id=cleaner.id,
            fingerprint_hash="seed-cleaner-browser",
            device_name="Seed Browser",
            last_used=datetime.utcnow(),
        )
    )

    db.commit()
