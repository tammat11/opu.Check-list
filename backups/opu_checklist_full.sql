--
-- PostgreSQL database dump
--

\restrict slnni1Cx2fn1jHAZtyNYhovE74DrFyJBSKDj3WteIkhfjtNZTZE0bL8PmCTOXIH

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_assigned_object_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_assigned_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_locations DROP CONSTRAINT IF EXISTS user_locations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_items DROP CONSTRAINT IF EXISTS template_items_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_sessions DROP CONSTRAINT IF EXISTS shift_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_sessions DROP CONSTRAINT IF EXISTS shift_sessions_object_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shift_sessions DROP CONSTRAINT IF EXISTS shift_sessions_active_checklist_id_fkey;
ALTER TABLE IF EXISTS ONLY public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.personal_checklist_items DROP CONSTRAINT IF EXISTS personal_checklist_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.objects DROP CONSTRAINT IF EXISTS objects_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.objects DROP CONSTRAINT IF EXISTS objects_curator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.objects DROP CONSTRAINT IF EXISTS objects_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_checklist_id_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_templates DROP CONSTRAINT IF EXISTS checklist_templates_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_progress DROP CONSTRAINT IF EXISTS checklist_progress_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_progress DROP CONSTRAINT IF EXISTS checklist_progress_checklist_id_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_assignments DROP CONSTRAINT IF EXISTS checklist_assignments_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_assignments DROP CONSTRAINT IF EXISTS checklist_assignments_object_id_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_assignments DROP CONSTRAINT IF EXISTS checklist_assignments_assigned_by_fkey;
ALTER TABLE IF EXISTS ONLY public.browser_fingerprints DROP CONSTRAINT IF EXISTS browser_fingerprints_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_requests DROP CONSTRAINT IF EXISTS approval_requests_responded_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_requests DROP CONSTRAINT IF EXISTS approval_requests_requested_from_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_requests DROP CONSTRAINT IF EXISTS approval_requests_requested_by_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_requests DROP CONSTRAINT IF EXISTS approval_requests_created_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.approval_requests DROP CONSTRAINT IF EXISTS approval_requests_approved_object_id_fkey;
ALTER TABLE IF EXISTS ONLY public.active_checklists DROP CONSTRAINT IF EXISTS active_checklists_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.active_checklists DROP CONSTRAINT IF EXISTS active_checklists_object_id_fkey;
ALTER TABLE IF EXISTS ONLY public.active_checklists DROP CONSTRAINT IF EXISTS active_checklists_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.active_checklists DROP CONSTRAINT IF EXISTS active_checklists_assigned_by_fkey;
DROP INDEX IF EXISTS public.ix_users_status;
DROP INDEX IF EXISTS public.ix_users_role;
DROP INDEX IF EXISTS public.ix_users_phone;
DROP INDEX IF EXISTS public.ix_users_iin;
DROP INDEX IF EXISTS public.ix_user_locations_user_id;
DROP INDEX IF EXISTS public.ix_shift_sessions_status;
DROP INDEX IF EXISTS public.ix_push_subscriptions_user_id;
DROP INDEX IF EXISTS public.ix_objects_status;
DROP INDEX IF EXISTS public.ix_objects_name;
DROP INDEX IF EXISTS public.ix_checklist_templates_name;
DROP INDEX IF EXISTS public.ix_browser_fingerprints_user_id;
DROP INDEX IF EXISTS public.ix_approval_requests_status;
DROP INDEX IF EXISTS public.ix_active_checklists_status;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY public.user_locations DROP CONSTRAINT IF EXISTS user_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.checklist_progress DROP CONSTRAINT IF EXISTS uq_progress_checklist_item;
ALTER TABLE IF EXISTS ONLY public.checklist_assignments DROP CONSTRAINT IF EXISTS uq_assignment_template_object;
ALTER TABLE IF EXISTS ONLY public.template_items DROP CONSTRAINT IF EXISTS template_items_pkey;
ALTER TABLE IF EXISTS ONLY public.shift_sessions DROP CONSTRAINT IF EXISTS shift_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_endpoint_key;
ALTER TABLE IF EXISTS ONLY public.personal_checklist_items DROP CONSTRAINT IF EXISTS personal_checklist_items_pkey;
ALTER TABLE IF EXISTS ONLY public.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.checklist_templates DROP CONSTRAINT IF EXISTS checklist_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.checklist_progress DROP CONSTRAINT IF EXISTS checklist_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.checklist_assignments DROP CONSTRAINT IF EXISTS checklist_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.browser_fingerprints DROP CONSTRAINT IF EXISTS browser_fingerprints_pkey;
ALTER TABLE IF EXISTS ONLY public.browser_fingerprints DROP CONSTRAINT IF EXISTS browser_fingerprints_fingerprint_hash_key;
ALTER TABLE IF EXISTS ONLY public.approval_requests DROP CONSTRAINT IF EXISTS approval_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.alembic_version DROP CONSTRAINT IF EXISTS alembic_version_pkc;
ALTER TABLE IF EXISTS ONLY public.active_checklists DROP CONSTRAINT IF EXISTS active_checklists_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_locations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shift_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.push_subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.personal_checklist_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.objects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.checklist_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.checklist_progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.checklist_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.browser_fingerprints ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.approval_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.active_checklists ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_locations_id_seq;
DROP TABLE IF EXISTS public.user_locations;
DROP SEQUENCE IF EXISTS public.template_items_id_seq;
DROP TABLE IF EXISTS public.template_items;
DROP SEQUENCE IF EXISTS public.shift_sessions_id_seq;
DROP TABLE IF EXISTS public.shift_sessions;
DROP SEQUENCE IF EXISTS public.push_subscriptions_id_seq;
DROP TABLE IF EXISTS public.push_subscriptions;
DROP SEQUENCE IF EXISTS public.personal_checklist_items_id_seq;
DROP TABLE IF EXISTS public.personal_checklist_items;
DROP SEQUENCE IF EXISTS public.objects_id_seq;
DROP TABLE IF EXISTS public.objects;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.checklist_templates_id_seq;
DROP TABLE IF EXISTS public.checklist_templates;
DROP SEQUENCE IF EXISTS public.checklist_progress_id_seq;
DROP TABLE IF EXISTS public.checklist_progress;
DROP SEQUENCE IF EXISTS public.checklist_assignments_id_seq;
DROP TABLE IF EXISTS public.checklist_assignments;
DROP SEQUENCE IF EXISTS public.browser_fingerprints_id_seq;
DROP TABLE IF EXISTS public.browser_fingerprints;
DROP SEQUENCE IF EXISTS public.approval_requests_id_seq;
DROP TABLE IF EXISTS public.approval_requests;
DROP TABLE IF EXISTS public.alembic_version;
DROP SEQUENCE IF EXISTS public.active_checklists_id_seq;
DROP TABLE IF EXISTS public.active_checklists;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: active_checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_checklists (
    id integer NOT NULL,
    template_id integer NOT NULL,
    object_id integer NOT NULL,
    assigned_to integer NOT NULL,
    assigned_by integer NOT NULL,
    status character varying(50) NOT NULL,
    due_date timestamp without time zone,
    shift_date date,
    priority character varying(30) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    notes text
);


--
-- Name: active_checklists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_checklists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_checklists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_checklists_id_seq OWNED BY public.active_checklists.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: approval_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_requests (
    id integer NOT NULL,
    requested_by_id integer,
    requested_from_id integer NOT NULL,
    request_type character varying(50) NOT NULL,
    user_data json,
    status character varying(50) NOT NULL,
    rejection_reason character varying(255),
    created_at timestamp without time zone NOT NULL,
    responded_at timestamp without time zone,
    responded_by_id integer,
    approved_object_id integer,
    created_user_id integer
);


--
-- Name: approval_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.approval_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: approval_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.approval_requests_id_seq OWNED BY public.approval_requests.id;


--
-- Name: browser_fingerprints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.browser_fingerprints (
    id integer NOT NULL,
    user_id integer NOT NULL,
    fingerprint_hash character varying(256) NOT NULL,
    device_name character varying(255),
    last_used timestamp without time zone,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: browser_fingerprints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.browser_fingerprints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: browser_fingerprints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.browser_fingerprints_id_seq OWNED BY public.browser_fingerprints.id;


--
-- Name: checklist_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_assignments (
    id integer NOT NULL,
    template_id integer NOT NULL,
    object_id integer,
    is_default boolean NOT NULL,
    assigned_by integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: checklist_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checklist_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checklist_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checklist_assignments_id_seq OWNED BY public.checklist_assignments.id;


--
-- Name: checklist_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_progress (
    id integer NOT NULL,
    checklist_id integer NOT NULL,
    item_id integer NOT NULL,
    completed boolean NOT NULL,
    note text,
    photo_url character varying(512),
    completed_at timestamp without time zone,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: checklist_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checklist_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checklist_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checklist_progress_id_seq OWNED BY public.checklist_progress.id;


--
-- Name: checklist_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: checklist_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.checklist_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: checklist_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.checklist_templates_id_seq OWNED BY public.checklist_templates.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    checklist_id integer,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    notification_type character varying(50),
    scheduled_for timestamp without time zone,
    sent boolean NOT NULL,
    sent_at timestamp without time zone,
    read_at timestamp without time zone,
    metadata json NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: objects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.objects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address text,
    city character varying(100),
    district character varying(120),
    latitude double precision,
    longitude double precision,
    workers_count integer NOT NULL,
    status character varying(50) NOT NULL,
    partner_id integer,
    curator_id integer,
    created_by integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: objects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.objects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: objects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.objects_id_seq OWNED BY public.objects.id;


--
-- Name: personal_checklist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_checklist_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    completed boolean NOT NULL,
    completed_at timestamp without time zone,
    sort_order integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: personal_checklist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_checklist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_checklist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_checklist_items_id_seq OWNED BY public.personal_checklist_items.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    endpoint character varying(512) NOT NULL,
    auth_key character varying(256) NOT NULL,
    p256dh_key character varying(256) NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: shift_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    object_id integer,
    active_checklist_id integer,
    status character varying(50) NOT NULL,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    notes text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: shift_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shift_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shift_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shift_sessions_id_seq OWNED BY public.shift_sessions.id;


--
-- Name: template_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.template_items (
    id integer NOT NULL,
    template_id integer NOT NULL,
    title character varying(255) NOT NULL,
    zone character varying(120),
    icon character varying(60),
    duration_minutes integer,
    requires_photo boolean NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: template_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.template_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: template_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.template_items_id_seq OWNED BY public.template_items.id;


--
-- Name: user_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_locations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    accuracy double precision,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: user_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_locations_id_seq OWNED BY public.user_locations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    phone character varying(20) NOT NULL,
    iin character varying(12) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    password_hash character varying(255),
    role character varying(50) NOT NULL,
    parent_id integer,
    status character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assigned_object_id integer,
    assigned_by_id integer,
    assigned_at timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: active_checklists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_checklists ALTER COLUMN id SET DEFAULT nextval('public.active_checklists_id_seq'::regclass);


--
-- Name: approval_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests ALTER COLUMN id SET DEFAULT nextval('public.approval_requests_id_seq'::regclass);


--
-- Name: browser_fingerprints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.browser_fingerprints ALTER COLUMN id SET DEFAULT nextval('public.browser_fingerprints_id_seq'::regclass);


--
-- Name: checklist_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_assignments ALTER COLUMN id SET DEFAULT nextval('public.checklist_assignments_id_seq'::regclass);


--
-- Name: checklist_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_progress ALTER COLUMN id SET DEFAULT nextval('public.checklist_progress_id_seq'::regclass);


--
-- Name: checklist_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_templates ALTER COLUMN id SET DEFAULT nextval('public.checklist_templates_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: objects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objects ALTER COLUMN id SET DEFAULT nextval('public.objects_id_seq'::regclass);


--
-- Name: personal_checklist_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_checklist_items ALTER COLUMN id SET DEFAULT nextval('public.personal_checklist_items_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: shift_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_sessions ALTER COLUMN id SET DEFAULT nextval('public.shift_sessions_id_seq'::regclass);


--
-- Name: template_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_items ALTER COLUMN id SET DEFAULT nextval('public.template_items_id_seq'::regclass);


--
-- Name: user_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations ALTER COLUMN id SET DEFAULT nextval('public.user_locations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: active_checklists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.active_checklists (id, template_id, object_id, assigned_to, assigned_by, status, due_date, shift_date, priority, created_at, started_at, completed_at, notes) FROM stdin;
1	1	1	6	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.030164	\N	\N	Импортировано из Excel
2	1	2	7	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.040237	\N	\N	Импортировано из Excel
3	1	2	8	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.042766	\N	\N	Импортировано из Excel
4	1	3	9	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.047684	\N	\N	Импортировано из Excel
5	1	4	10	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.05304	\N	\N	Импортировано из Excel
6	1	5	11	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.058547	\N	\N	Импортировано из Excel
7	1	5	12	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.0614	\N	\N	Импортировано из Excel
8	1	6	13	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.06674	\N	\N	Импортировано из Excel
9	1	7	14	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.070648	\N	\N	Импортировано из Excel
10	1	7	15	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.072941	\N	\N	Импортировано из Excel
11	1	8	16	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.076539	\N	\N	Импортировано из Excel
12	1	9	17	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.080186	\N	\N	Импортировано из Excel
13	1	9	18	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.082483	\N	\N	Импортировано из Excel
14	1	10	19	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.088098	\N	\N	Импортировано из Excel
15	1	10	20	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.090967	\N	\N	Импортировано из Excel
16	1	11	21	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.09506	\N	\N	Импортировано из Excel
17	1	12	22	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.098584	\N	\N	Импортировано из Excel
18	1	13	23	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.102354	\N	\N	Импортировано из Excel
19	1	14	24	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.106962	\N	\N	Импортировано из Excel
20	1	15	25	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.11216	\N	\N	Импортировано из Excel
21	1	16	25	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.116674	\N	\N	Импортировано из Excel
22	1	17	25	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.12052	\N	\N	Импортировано из Excel
23	1	18	26	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.124924	\N	\N	Импортировано из Excel
24	1	19	27	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.128832	\N	\N	Импортировано из Excel
25	1	20	28	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.132013	\N	\N	Импортировано из Excel
26	1	20	29	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.133586	\N	\N	Импортировано из Excel
27	1	20	30	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.135124	\N	\N	Импортировано из Excel
28	1	20	31	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.136588	\N	\N	Импортировано из Excel
29	1	20	32	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.138632	\N	\N	Импортировано из Excel
30	1	20	33	3	pending	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.140795	\N	\N	Импортировано из Excel
31	1	1	5	4	completed	2026-06-19 12:54:42.024166	2026-06-19	normal	2026-06-19 04:54:42.142402	2026-06-19 06:08:07.307109	2026-06-19 10:41:03.585221	ул. Туран 44Б\nGPS: not available\nCompleted tasks: 5/5
32	1	2	5	1	in_progress	\N	2026-06-19	normal	2026-06-19 11:16:55.137279	2026-06-19 11:18:20.556011	\N	demo-start: ул. Мангилик Ел, 19
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alembic_version (version_num) FROM stdin;
20260619_000002
\.


--
-- Data for Name: approval_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.approval_requests (id, requested_by_id, requested_from_id, request_type, user_data, status, rejection_reason, created_at, responded_at, responded_by_id, approved_object_id, created_user_id) FROM stdin;
\.


--
-- Data for Name: browser_fingerprints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.browser_fingerprints (id, user_id, fingerprint_hash, device_name, last_used, created_at) FROM stdin;
2	5	7a115bae28a29fcb4cb17eb8c88605ceda3cc1ed93f4059392e946f0fa9e529c	\N	2026-06-19 05:48:41.140822	2026-06-19 05:48:41.141892
\.


--
-- Data for Name: checklist_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_assignments (id, template_id, object_id, is_default, assigned_by, created_at) FROM stdin;
1	1	\N	t	1	2026-06-19 04:54:42.021687
2	1	1	f	1	2026-06-19 04:54:42.033394
3	1	2	f	1	2026-06-19 04:54:42.041429
4	1	3	f	1	2026-06-19 04:54:42.048989
5	1	4	f	1	2026-06-19 04:54:42.054092
6	1	5	f	1	2026-06-19 04:54:42.059852
7	1	6	f	1	2026-06-19 04:54:42.06744
8	1	7	f	1	2026-06-19 04:54:42.071729
9	1	8	f	1	2026-06-19 04:54:42.077272
10	1	9	f	1	2026-06-19 04:54:42.081156
11	1	10	f	1	2026-06-19 04:54:42.089576
12	1	11	f	1	2026-06-19 04:54:42.095774
13	1	12	f	1	2026-06-19 04:54:42.099386
14	1	13	f	1	2026-06-19 04:54:42.103026
15	1	14	f	1	2026-06-19 04:54:42.107992
16	1	15	f	1	2026-06-19 04:54:42.113234
17	1	16	f	1	2026-06-19 04:54:42.117587
18	1	17	f	1	2026-06-19 04:54:42.121479
19	1	18	f	1	2026-06-19 04:54:42.125852
20	1	19	f	1	2026-06-19 04:54:42.129564
21	1	20	f	1	2026-06-19 04:54:42.132722
\.


--
-- Data for Name: checklist_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_progress (id, checklist_id, item_id, completed, note, photo_url, completed_at, updated_at) FROM stdin;
1	31	1	t	Зал / Офис\nBefore: /uploads/checklists/5/20260619104103-3f63376b44094f729ed6630a7985f049.jpeg, /uploads/checklists/5/20260619104103-efb154424ca64b7fb01d99caa192d10d.jpg, /uploads/checklists/5/20260619104103-5a1eea6e34924781a030ca536bf11c78.jpeg\nAfter: /uploads/checklists/5/20260619104103-96365fb82fe847979607caf170c0d142.jpg, /uploads/checklists/5/20260619104103-3f298c8d99594dc6813bea86f810857d.jpg, /uploads/checklists/5/20260619104103-86f4eaae86a744488f3dacd22f79e26f.jpg	/uploads/checklists/5/20260619104103-96365fb82fe847979607caf170c0d142.jpg	2026-06-19 10:41:03.455432	2026-06-19 10:41:03.457037
2	31	2	t	Зал / Офис	\N	2026-06-19 10:41:03.492103	2026-06-19 10:41:03.492476
3	31	3	t	Зал / Офис	\N	2026-06-19 10:41:03.516206	2026-06-19 10:41:03.516753
4	31	4	t	Зал / Офис	\N	2026-06-19 10:41:03.534597	2026-06-19 10:41:03.535011
5	31	5	t	Зал / Офис	\N	2026-06-19 10:41:03.550311	2026-06-19 10:41:03.550742
\.


--
-- Data for Name: checklist_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_templates (id, name, description, is_active, created_by, created_at, updated_at) FROM stdin;
1	Kaspi Bank	Базовый чек-лист для объектов Kaspi	t	1	2026-06-19 04:54:42.013822	2026-06-19 04:54:42.013826
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, checklist_id, title, message, notification_type, scheduled_for, sent, sent_at, read_at, metadata, created_at) FROM stdin;
1	5	32	Назначен новый чек-лист	У вас появилась новая смена	assignment	\N	f	\N	\N	{"source": "assignment"}	2026-06-19 11:16:55.156805
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.objects (id, name, address, city, district, latitude, longitude, workers_count, status, partner_id, curator_id, created_by, created_at, updated_at) FROM stdin;
4	ул. Кенесары, 78	ул. Кенесары, 78	Астана	\N	51.1627124	71.4626019	1	active	2	3	1	2026-06-19 04:54:42.050274	2026-06-19 05:30:48.172278
5	ул. Кажымукана, 2	ул. Кажымукана, 2	Астана	\N	51.1515051	71.4590854	2	active	2	3	1	2026-06-19 04:54:42.055816	2026-06-19 05:30:48.172281
7	ул. Сыганак, 10	ул. Сыганак, 10	Астана	\N	51.1241005	71.4196463	2	active	2	3	1	2026-06-19 04:54:42.068834	2026-06-19 05:30:48.172283
9	ул. Кунаева 14	ул. Кунаева 14	Астана	\N	51.1284264	71.435346	2	active	2	3	1	2026-06-19 04:54:42.078263	2026-06-19 05:30:48.172285
10	ул. Достык, 12	ул. Достык, 12	Астана	\N	51.1260853	71.4261403	2	active	2	3	1	2026-06-19 04:54:42.085415	2026-06-19 05:30:48.172286
13	ул. Есенберлина, 12	ул. Есенберлина, 12	Астана	\N	51.1908509	71.4077546	1	active	2	3	1	2026-06-19 04:54:42.100398	2026-06-19 05:30:48.172288
14	ул. Молдагулова 27	ул. Молдагулова 27	Астана	\N	51.1860665	71.4104256	1	active	2	3	1	2026-06-19 04:54:42.104208	2026-06-19 05:30:48.172289
20	ул. Иманова 8	ул. Иманова 8	Астана	\N	51.1626871	71.4302624	6	active	2	3	1	2026-06-19 04:54:42.13057	2026-06-19 05:30:48.172293
3	пр. Аль-Фараби, 55	пр. Аль-Фараби, 55	Астана	\N	51.1799401	71.470954	1	active	2	3	1	2026-06-19 04:54:42.045248	2026-06-19 05:36:30.213175
8	ул. Абылай хана 34	ул. Абылай хана 34	Астана	\N	51.1536331	71.4854023	1	active	2	3	1	2026-06-19 04:54:42.07479	2026-06-19 05:36:30.213179
18	ул. Туран 55	ул. Туран 55	Астана	\N	51.1127627	71.3983764	1	active	2	3	1	2026-06-19 04:54:42.122869	2026-06-19 05:36:30.213181
19	ул. Мангилик Ел 42	ул. Мангилик Ел 42	Астана	\N	51.0989858	71.4289698	1	active	2	3	1	2026-06-19 04:54:42.127041	2026-06-19 05:36:30.213183
1	ул. Туран 44Б	ул. Туран 44Б	Астана	\N	51.113389	71.402303	1	active	2	3	1	2026-06-19 04:54:42.025772	2026-06-19 04:54:42.025775
2	ул. Мангилик Ел, 19	ул. Мангилик Ел, 19	Астана	\N	51.114362	71.432846	2	active	2	3	1	2026-06-19 04:54:42.035034	2026-06-19 05:36:30.213167
6	ул. Женис 25	ул. Женис 25	Астана	\N	51.170542	71.412086	1	active	2	3	1	2026-06-19 04:54:42.064116	2026-06-19 05:36:30.213177
11	ул. Валиханова 13	ул. Валиханова 13	Астана	\N	51.168165	71.439098	1	active	2	3	1	2026-06-19 04:54:42.093018	2026-06-19 04:54:42.093022
12	ул. Мухаметханова, 11/1	ул. Мухаметханова, 11/1	Астана	\N	51.139217	71.396661	1	active	2	3	1	2026-06-19 04:54:42.096895	2026-06-19 04:54:42.096898
15	БЦ Арман, архив	БЦ Арман, архив	Астана	\N	51.160206	71.411834	1	active	2	3	1	2026-06-19 04:54:42.109434	2026-06-19 04:54:42.10944
16	БЦ Арман, региональная администрация	БЦ Арман, региональная администрация	Астана	\N	51.160206	71.411834	1	active	2	3	1	2026-06-19 04:54:42.114621	2026-06-19 04:54:42.114628
17	БЦ Арман, отдел кадров	БЦ Арман, отдел кадров	Астана	\N	51.160206	71.411834	1	active	2	3	1	2026-06-19 04:54:42.118659	2026-06-19 04:54:42.118663
\.


--
-- Data for Name: personal_checklist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_checklist_items (id, user_id, title, completed, completed_at, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_subscriptions (id, user_id, endpoint, auth_key, p256dh_key, created_at) FROM stdin;
\.


--
-- Data for Name: shift_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shift_sessions (id, user_id, object_id, active_checklist_id, status, start_time, end_time, notes, created_at, updated_at) FROM stdin;
1	6	1	1	planned	\N	\N	\N	2026-06-19 04:54:42.036991	2026-06-19 04:54:42.036995
2	7	2	2	planned	\N	\N	\N	2026-06-19 04:54:42.043836	2026-06-19 04:54:42.043841
3	8	2	3	planned	\N	\N	\N	2026-06-19 04:54:42.046167	2026-06-19 04:54:42.046171
4	9	3	4	planned	\N	\N	\N	2026-06-19 04:54:42.051363	2026-06-19 04:54:42.051366
5	10	4	5	planned	\N	\N	\N	2026-06-19 04:54:42.057122	2026-06-19 04:54:42.057127
6	11	5	6	planned	\N	\N	\N	2026-06-19 04:54:42.062238	2026-06-19 04:54:42.062243
7	12	5	7	planned	\N	\N	\N	2026-06-19 04:54:42.06565	2026-06-19 04:54:42.065655
8	13	6	8	planned	\N	\N	\N	2026-06-19 04:54:42.069532	2026-06-19 04:54:42.069535
9	14	7	9	planned	\N	\N	\N	2026-06-19 04:54:42.073712	2026-06-19 04:54:42.073716
10	15	7	10	planned	\N	\N	\N	2026-06-19 04:54:42.075469	2026-06-19 04:54:42.075472
11	16	8	11	planned	\N	\N	\N	2026-06-19 04:54:42.078971	2026-06-19 04:54:42.078975
12	17	9	12	planned	\N	\N	\N	2026-06-19 04:54:42.083588	2026-06-19 04:54:42.083594
13	18	9	13	planned	\N	\N	\N	2026-06-19 04:54:42.086754	2026-06-19 04:54:42.08676
14	19	10	14	planned	\N	\N	\N	2026-06-19 04:54:42.091783	2026-06-19 04:54:42.091787
15	20	10	15	planned	\N	\N	\N	2026-06-19 04:54:42.093987	2026-06-19 04:54:42.093992
16	21	11	16	planned	\N	\N	\N	2026-06-19 04:54:42.097595	2026-06-19 04:54:42.097599
17	22	12	17	planned	\N	\N	\N	2026-06-19 04:54:42.101163	2026-06-19 04:54:42.101168
18	23	13	18	planned	\N	\N	\N	2026-06-19 04:54:42.105566	2026-06-19 04:54:42.10557
19	24	14	19	planned	\N	\N	\N	2026-06-19 04:54:42.110614	2026-06-19 04:54:42.110621
20	25	15	20	planned	\N	\N	\N	2026-06-19 04:54:42.115481	2026-06-19 04:54:42.115486
21	25	16	21	planned	\N	\N	\N	2026-06-19 04:54:42.11943	2026-06-19 04:54:42.119434
22	25	17	22	planned	\N	\N	\N	2026-06-19 04:54:42.123657	2026-06-19 04:54:42.123661
23	26	18	23	planned	\N	\N	\N	2026-06-19 04:54:42.127793	2026-06-19 04:54:42.127796
24	27	19	24	planned	\N	\N	\N	2026-06-19 04:54:42.131178	2026-06-19 04:54:42.131181
25	28	20	25	planned	\N	\N	\N	2026-06-19 04:54:42.134255	2026-06-19 04:54:42.134258
26	29	20	26	planned	\N	\N	\N	2026-06-19 04:54:42.135727	2026-06-19 04:54:42.13573
27	30	20	27	planned	\N	\N	\N	2026-06-19 04:54:42.137355	2026-06-19 04:54:42.137359
28	31	20	28	planned	\N	\N	\N	2026-06-19 04:54:42.139718	2026-06-19 04:54:42.139723
29	32	20	29	planned	\N	\N	\N	2026-06-19 04:54:42.141463	2026-06-19 04:54:42.141467
30	33	20	30	planned	\N	\N	\N	2026-06-19 04:54:42.143056	2026-06-19 04:54:42.14306
31	5	1	31	completed	2026-06-19 06:08:07.310193	2026-06-19 10:41:03.594116	\N	2026-06-19 04:54:42.143814	2026-06-19 10:41:03.60053
32	5	2	32	active	2026-06-19 11:18:20.556626	\N	\N	2026-06-19 11:16:55.167056	2026-06-19 11:18:20.557154
\.


--
-- Data for Name: template_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.template_items (id, template_id, title, zone, icon, duration_minutes, requires_photo, order_index, created_at) FROM stdin;
1	1	Пропылесосить / подмести	Зал / Офис	vacuum	15	t	0	2026-06-19 04:54:42.017739
2	1	Протереть столы и стулья	Зал / Офис	table	10	t	1	2026-06-19 04:54:42.017744
3	1	Вынести мусор	Зал / Офис	trash_bin	5	t	2	2026-06-19 04:54:42.017746
4	1	Протереть подоконники	Зал / Офис	window	5	t	3	2026-06-19 04:54:42.017747
5	1	Помыть полы	Зал / Офис	mop	15	t	4	2026-06-19 04:54:42.017749
\.


--
-- Data for Name: user_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_locations (id, user_id, latitude, longitude, accuracy, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, phone, iin, name, email, password_hash, role, parent_id, status, created_at, updated_at, assigned_object_id, assigned_by_id, assigned_at) FROM stdin;
1	+7 700 000 00 01	111111111111	Админ Алина	\N	$pbkdf2-sha256$29000$ozQGYAxhbK3V2jun9D7n/A$ubTdW075O9i07Q08RSeZv90W9qNmqylb0Fi0wI9nTSk	admin	\N	active	2026-06-19 04:54:41.994826	2026-06-19 04:54:41.994832	\N	\N	\N
2	+7 700 000 00 02	222222222222	Полоз О	\N	$pbkdf2-sha256$29000$V.qdszbGeA.hlPI.57z33g$/Igk3IEdsL6vf003wvTHKeb/8UZa/L67EUpyYDMBDCo	partner	\N	active	2026-06-19 04:54:41.994834	2026-06-19 04:54:41.994835	\N	\N	\N
3	+7 775 665 77 83	840416402485	Амирбекова Гульмира	\N	\N	curator	2	active	2026-06-19 04:54:42.000264	2026-06-19 04:54:42.000269	\N	\N	\N
4	+7 700 000 00 03	333333333333	Амирбекова Гульмира (тест)	\N	$pbkdf2-sha256$29000$4fyfE0KoFQIgpFTK.d97rw$tu1pbaBaYZEyVXN0Um2ks3PZnD4mUPtoxI0D2OmxIH8	curator	2	active	2026-06-19 04:54:42.000271	2026-06-19 04:54:42.000272	\N	\N	\N
5	+7 700 000 00 04	444444444444	Клинер Дана	\N	$pbkdf2-sha256$29000$LmUs5ZxzrjUGICSkNEbI.Q$MmvCQO4DAVP.nmgw8CJQX0GaENR5smbdpJchTC7/vlA	cleaner	3	active	2026-06-19 04:54:42.003201	2026-06-19 04:54:42.003211	2	1	2026-06-19 11:16:55.137279
6	+7 707 066 09 21	770921403403	Кенжеева Дильмира	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007609	2026-06-19 04:54:42.007614	1	3	2026-06-19 04:54:42.030164
7	+7 702 540 27 05	620120401422	Созакбаева Моншак	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007616	2026-06-19 04:54:42.007617	2	3	2026-06-19 04:54:42.040237
8	+7 702 566 07 45	600115450468	Кажмуратова Алтынай	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007619	2026-06-19 04:54:42.00762	2	3	2026-06-19 04:54:42.042766
9	+7 775 124 75 41	930821450961	Турдыбекова Наргиза	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007621	2026-06-19 04:54:42.007622	3	3	2026-06-19 04:54:42.047684
10	+7 705 582 83 87	641212450556	Мажыранова Надежда	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007623	2026-06-19 04:54:42.007624	4	3	2026-06-19 04:54:42.05304
11	+7 747 150 39 70	750804403205	Шортанбаева Мадина	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007626	2026-06-19 04:54:42.007627	5	3	2026-06-19 04:54:42.058547
12	+7 775 539 53 19	620206450147	Ибраева Айман	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007628	2026-06-19 04:54:42.007629	5	3	2026-06-19 04:54:42.0614
13	+7 705 429 87 01	621104050034	Имоналиева Ташбуби	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007631	2026-06-19 04:54:42.007632	6	3	2026-06-19 04:54:42.06674
14	+7 702 865 83 41	640225402702	Калиева Гульшара	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007633	2026-06-19 04:54:42.007634	7	3	2026-06-19 04:54:42.070648
15	+7 747 381 36 91	891117401592	Сарсенбаева Замира	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007635	2026-06-19 04:54:42.007636	7	3	2026-06-19 04:54:42.072941
16	+7 775 408 19 53	670208401677	Сулейменова Рамаш	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007637	2026-06-19 04:54:42.007639	8	3	2026-06-19 04:54:42.076539
17	+7 702 672 64 70	700401403611	Алтынбекова Гульжан	\N	\N	cleaner	3	active	2026-06-19 04:54:42.00764	2026-06-19 04:54:42.007641	9	3	2026-06-19 04:54:42.080186
18	+7 778 318 94 71	720924450630	Бакиева Гульнар	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007642	2026-06-19 04:54:42.007643	9	3	2026-06-19 04:54:42.082483
19	+7 775 729 96 20	700525402162	Сырлыбаева Бибикуль	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007644	2026-06-19 04:54:42.007646	10	3	2026-06-19 04:54:42.088098
20	+7 777 519 02 21	650203400123	Кожакова Назипа	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007647	2026-06-19 04:54:42.007648	10	3	2026-06-19 04:54:42.090967
21	+7 776 105 89 90	900405401976	Булекбаева Эльмира	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007649	2026-06-19 04:54:42.00765	11	3	2026-06-19 04:54:42.09506
22	+7 701 843 44 68	680112450379	Ускембаева Тазагуль	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007651	2026-06-19 04:54:42.007652	12	3	2026-06-19 04:54:42.098584
23	+7 702 750 74 57	730303402745	Сарманова Бану	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007654	2026-06-19 04:54:42.007655	13	3	2026-06-19 04:54:42.102354
24	+7 705 343 92 76	760416403337	Аликина Антонина	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007656	2026-06-19 04:54:42.007657	14	3	2026-06-19 04:54:42.106962
25	+7 707 483 95 79	790123450054	Тусупова Индира	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007658	2026-06-19 04:54:42.007659	17	3	2026-06-19 04:54:42.12052
26	+7 771 317 10 23	730519401187	Бапаева Атиркул	\N	\N	cleaner	3	active	2026-06-19 04:54:42.00766	2026-06-19 04:54:42.007661	18	3	2026-06-19 04:54:42.124924
27	+7 775 137 38 74	640920450542	Капарова Зауреш	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007663	2026-06-19 04:54:42.007664	19	3	2026-06-19 04:54:42.128832
28	+7 707 501 52 08	750506401467	Бобрик Наталья	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007665	2026-06-19 04:54:42.007666	20	3	2026-06-19 04:54:42.132013
29	+7 702 192 95 70	910825450256	Прудникова Наталья	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007667	2026-06-19 04:54:42.007668	20	3	2026-06-19 04:54:42.133586
30	+7 707 978 04 81	640222401867	Ыдырысова Кульсин	\N	\N	cleaner	3	active	2026-06-19 04:54:42.00767	2026-06-19 04:54:42.007671	20	3	2026-06-19 04:54:42.135124
31	+7 702 480 36 17	480910302418	Тусупеков Базарбай	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007672	2026-06-19 04:54:42.007673	20	3	2026-06-19 04:54:42.136588
32	+7 775 647 91 88	881003400894	Балтабаева Бибигуль	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007674	2026-06-19 04:54:42.007675	20	3	2026-06-19 04:54:42.138632
33	+7 705 534 56 53	930123451241	Галы Назерке	\N	\N	cleaner	3	active	2026-06-19 04:54:42.007676	2026-06-19 04:54:42.007677	20	3	2026-06-19 04:54:42.140795
\.


--
-- Name: active_checklists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.active_checklists_id_seq', 32, true);


--
-- Name: approval_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.approval_requests_id_seq', 1, true);


--
-- Name: browser_fingerprints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.browser_fingerprints_id_seq', 4, true);


--
-- Name: checklist_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checklist_assignments_id_seq', 21, true);


--
-- Name: checklist_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checklist_progress_id_seq', 5, true);


--
-- Name: checklist_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.checklist_templates_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, true);


--
-- Name: objects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.objects_id_seq', 20, true);


--
-- Name: personal_checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_checklist_items_id_seq', 1, false);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 1, false);


--
-- Name: shift_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shift_sessions_id_seq', 32, true);


--
-- Name: template_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.template_items_id_seq', 5, true);


--
-- Name: user_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_locations_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 33, true);


--
-- Name: active_checklists active_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_checklists
    ADD CONSTRAINT active_checklists_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: approval_requests approval_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_pkey PRIMARY KEY (id);


--
-- Name: browser_fingerprints browser_fingerprints_fingerprint_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.browser_fingerprints
    ADD CONSTRAINT browser_fingerprints_fingerprint_hash_key UNIQUE (fingerprint_hash);


--
-- Name: browser_fingerprints browser_fingerprints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.browser_fingerprints
    ADD CONSTRAINT browser_fingerprints_pkey PRIMARY KEY (id);


--
-- Name: checklist_assignments checklist_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_assignments
    ADD CONSTRAINT checklist_assignments_pkey PRIMARY KEY (id);


--
-- Name: checklist_progress checklist_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_progress
    ADD CONSTRAINT checklist_progress_pkey PRIMARY KEY (id);


--
-- Name: checklist_templates checklist_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_templates
    ADD CONSTRAINT checklist_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: personal_checklist_items personal_checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_checklist_items
    ADD CONSTRAINT personal_checklist_items_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: shift_sessions shift_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_sessions
    ADD CONSTRAINT shift_sessions_pkey PRIMARY KEY (id);


--
-- Name: template_items template_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_items
    ADD CONSTRAINT template_items_pkey PRIMARY KEY (id);


--
-- Name: checklist_assignments uq_assignment_template_object; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_assignments
    ADD CONSTRAINT uq_assignment_template_object UNIQUE (template_id, object_id);


--
-- Name: checklist_progress uq_progress_checklist_item; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_progress
    ADD CONSTRAINT uq_progress_checklist_item UNIQUE (checklist_id, item_id);


--
-- Name: user_locations user_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_active_checklists_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_active_checklists_status ON public.active_checklists USING btree (status);


--
-- Name: ix_approval_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_approval_requests_status ON public.approval_requests USING btree (status);


--
-- Name: ix_browser_fingerprints_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_browser_fingerprints_user_id ON public.browser_fingerprints USING btree (user_id);


--
-- Name: ix_checklist_templates_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_checklist_templates_name ON public.checklist_templates USING btree (name);


--
-- Name: ix_objects_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_objects_name ON public.objects USING btree (name);


--
-- Name: ix_objects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_objects_status ON public.objects USING btree (status);


--
-- Name: ix_push_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_push_subscriptions_user_id ON public.push_subscriptions USING btree (user_id);


--
-- Name: ix_shift_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_shift_sessions_status ON public.shift_sessions USING btree (status);


--
-- Name: ix_user_locations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_user_locations_user_id ON public.user_locations USING btree (user_id);


--
-- Name: ix_users_iin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_iin ON public.users USING btree (iin);


--
-- Name: ix_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_phone ON public.users USING btree (phone);


--
-- Name: ix_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_role ON public.users USING btree (role);


--
-- Name: ix_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_status ON public.users USING btree (status);


--
-- Name: active_checklists active_checklists_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_checklists
    ADD CONSTRAINT active_checklists_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: active_checklists active_checklists_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_checklists
    ADD CONSTRAINT active_checklists_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: active_checklists active_checklists_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_checklists
    ADD CONSTRAINT active_checklists_object_id_fkey FOREIGN KEY (object_id) REFERENCES public.objects(id);


--
-- Name: active_checklists active_checklists_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_checklists
    ADD CONSTRAINT active_checklists_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.checklist_templates(id);


--
-- Name: approval_requests approval_requests_approved_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_approved_object_id_fkey FOREIGN KEY (approved_object_id) REFERENCES public.objects(id);


--
-- Name: approval_requests approval_requests_created_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_created_user_id_fkey FOREIGN KEY (created_user_id) REFERENCES public.users(id);


--
-- Name: approval_requests approval_requests_requested_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_requested_by_id_fkey FOREIGN KEY (requested_by_id) REFERENCES public.users(id);


--
-- Name: approval_requests approval_requests_requested_from_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_requested_from_id_fkey FOREIGN KEY (requested_from_id) REFERENCES public.users(id);


--
-- Name: approval_requests approval_requests_responded_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_responded_by_id_fkey FOREIGN KEY (responded_by_id) REFERENCES public.users(id);


--
-- Name: browser_fingerprints browser_fingerprints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.browser_fingerprints
    ADD CONSTRAINT browser_fingerprints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: checklist_assignments checklist_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_assignments
    ADD CONSTRAINT checklist_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: checklist_assignments checklist_assignments_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_assignments
    ADD CONSTRAINT checklist_assignments_object_id_fkey FOREIGN KEY (object_id) REFERENCES public.objects(id);


--
-- Name: checklist_assignments checklist_assignments_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_assignments
    ADD CONSTRAINT checklist_assignments_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.checklist_templates(id);


--
-- Name: checklist_progress checklist_progress_checklist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_progress
    ADD CONSTRAINT checklist_progress_checklist_id_fkey FOREIGN KEY (checklist_id) REFERENCES public.active_checklists(id);


--
-- Name: checklist_progress checklist_progress_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_progress
    ADD CONSTRAINT checklist_progress_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.template_items(id);


--
-- Name: checklist_templates checklist_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_templates
    ADD CONSTRAINT checklist_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: notifications notifications_checklist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_checklist_id_fkey FOREIGN KEY (checklist_id) REFERENCES public.active_checklists(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: objects objects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objects
    ADD CONSTRAINT objects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: objects objects_curator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objects
    ADD CONSTRAINT objects_curator_id_fkey FOREIGN KEY (curator_id) REFERENCES public.users(id);


--
-- Name: objects objects_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objects
    ADD CONSTRAINT objects_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.users(id);


--
-- Name: personal_checklist_items personal_checklist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_checklist_items
    ADD CONSTRAINT personal_checklist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: shift_sessions shift_sessions_active_checklist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_sessions
    ADD CONSTRAINT shift_sessions_active_checklist_id_fkey FOREIGN KEY (active_checklist_id) REFERENCES public.active_checklists(id);


--
-- Name: shift_sessions shift_sessions_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_sessions
    ADD CONSTRAINT shift_sessions_object_id_fkey FOREIGN KEY (object_id) REFERENCES public.objects(id);


--
-- Name: shift_sessions shift_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_sessions
    ADD CONSTRAINT shift_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: template_items template_items_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.template_items
    ADD CONSTRAINT template_items_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.checklist_templates(id);


--
-- Name: user_locations user_locations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_locations
    ADD CONSTRAINT user_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_assigned_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_assigned_by_id_fkey FOREIGN KEY (assigned_by_id) REFERENCES public.users(id);


--
-- Name: users users_assigned_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_assigned_object_id_fkey FOREIGN KEY (assigned_object_id) REFERENCES public.objects(id);


--
-- Name: users users_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict slnni1Cx2fn1jHAZtyNYhovE74DrFyJBSKDj3WteIkhfjtNZTZE0bL8PmCTOXIH

