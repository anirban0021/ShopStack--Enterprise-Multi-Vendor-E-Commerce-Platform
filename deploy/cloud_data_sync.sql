--
-- PostgreSQL database dump
--

\restrict 9bsTDipGj5d6Zm5Bk0FBpekhIo7uYjPVAVteTF1PqxtBOuRxYQdrmBE0HDWoawF

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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

ALTER TABLE IF EXISTS ONLY public.inbound_shipments DROP CONSTRAINT IF EXISTS fkqpf3n88dutrc0mo4buwrdhkgt;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS fkqnq71xsohugpqwf3c9gxmsuy;
ALTER TABLE IF EXISTS ONLY public.inventories DROP CONSTRAINT IF EXISTS fkoipfe4s81wodvutx9i0rlmoyi;
ALTER TABLE IF EXISTS ONLY public.inbound_shipments DROP CONSTRAINT IF EXISTS fkly24ftsoa5n2j5x7q85wh14bm;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS fkhenhdgs1hqlktjhe9df0g13yq;
ALTER TABLE IF EXISTS ONLY public.warehouse_allocations DROP CONSTRAINT IF EXISTS fkcq7m8gooevrm6r3lfwcbusveh;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS fk8wdmt04gphikujrrpmianl6xw;
ALTER TABLE IF EXISTS ONLY public.inventories DROP CONSTRAINT IF EXISTS fk8drmqyx629j3oo8ct9jnc5y3y;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS fk24aoj1hs71g3vit38m2ut0n3c;
ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_pkey;
ALTER TABLE IF EXISTS ONLY public.warehouses DROP CONSTRAINT IF EXISTS warehouses_pkey;
ALTER TABLE IF EXISTS ONLY public.warehouse_allocations DROP CONSTRAINT IF EXISTS warehouse_allocations_pkey;
ALTER TABLE IF EXISTS ONLY public.vendor_coupon_approvals DROP CONSTRAINT IF EXISTS vendor_coupon_approvals_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_addresses DROP CONSTRAINT IF EXISTS user_addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS ukick25fueer7ic8lpb758bj6b7;
ALTER TABLE IF EXISTS ONLY public.coupons DROP CONSTRAINT IF EXISTS ukeplt0kkm9yf2of2lnx6c1oy9b;
ALTER TABLE IF EXISTS ONLY public.inbound_shipments DROP CONSTRAINT IF EXISTS uk77tisl4431xy90l49q20ysuow;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uk6dotkott2kjsp8vw4d0m25fb7;
ALTER TABLE IF EXISTS ONLY public.stock_transfers DROP CONSTRAINT IF EXISTS stock_transfers_pkey;
ALTER TABLE IF EXISTS ONLY public.settlements DROP CONSTRAINT IF EXISTS settlements_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.refunds DROP CONSTRAINT IF EXISTS refunds_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_coupons DROP CONSTRAINT IF EXISTS product_coupons_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.inventories DROP CONSTRAINT IF EXISTS inventories_pkey;
ALTER TABLE IF EXISTS ONLY public.inbound_shipments DROP CONSTRAINT IF EXISTS inbound_shipments_pkey;
ALTER TABLE IF EXISTS ONLY public.coupons DROP CONSTRAINT IF EXISTS coupons_pkey;
ALTER TABLE IF EXISTS ONLY public.coupon_usages DROP CONSTRAINT IF EXISTS coupon_usages_pkey;
DROP TABLE IF EXISTS public.wishlist_items;
DROP TABLE IF EXISTS public.warehouses;
DROP TABLE IF EXISTS public.warehouse_allocations;
DROP TABLE IF EXISTS public.vendor_coupon_approvals;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_addresses;
DROP TABLE IF EXISTS public.stock_transfers;
DROP TABLE IF EXISTS public.settlements;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.refunds;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_images;
DROP TABLE IF EXISTS public.product_coupons;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.inventories;
DROP TABLE IF EXISTS public.inbound_shipments;
DROP TABLE IF EXISTS public.coupons;
DROP TABLE IF EXISTS public.coupon_usages;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: coupon_usages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_usages (
    id bigint NOT NULL,
    coupon_code character varying(255) NOT NULL,
    discount_amount double precision NOT NULL,
    order_id character varying(255) NOT NULL,
    usage_date_time timestamp(6) without time zone NOT NULL,
    user_email character varying(255),
    user_id bigint NOT NULL
);


ALTER TABLE public.coupon_usages OWNER TO postgres;

--
-- Name: coupon_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.coupon_usages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.coupon_usages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id bigint NOT NULL,
    active boolean NOT NULL,
    code character varying(255) NOT NULL,
    discount_type character varying(255) NOT NULL,
    discount_value double precision NOT NULL,
    expiry_date timestamp(6) without time zone NOT NULL,
    max_discount double precision,
    min_order_amount double precision,
    start_date timestamp(6) without time zone NOT NULL,
    usage_count integer NOT NULL,
    usage_limit integer
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.coupons ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.coupons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: inbound_shipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inbound_shipments (
    id bigint NOT NULL,
    bin_location character varying(255),
    courier_partner character varying(255),
    created_at timestamp(6) without time zone,
    damaged_quantity integer NOT NULL,
    declared_quantity integer NOT NULL,
    grn_number character varying(255),
    received_at timestamp(6) without time zone,
    received_quantity integer NOT NULL,
    shelved_at timestamp(6) without time zone,
    shipment_number character varying(255) NOT NULL,
    shipped_at timestamp(6) without time zone,
    staff_inspection_notes character varying(2000),
    status character varying(255),
    tracking_number character varying(255),
    vendor_id bigint,
    vendor_name character varying(255),
    vendor_notes character varying(2000),
    product_id bigint,
    warehouse_id bigint
);


ALTER TABLE public.inbound_shipments OWNER TO postgres;

--
-- Name: inbound_shipments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.inbound_shipments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.inbound_shipments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: inventories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventories (
    id bigint NOT NULL,
    allocated integer NOT NULL,
    bin_location character varying(255),
    damaged_quantity integer NOT NULL,
    quantity integer NOT NULL,
    product_id bigint,
    warehouse_id bigint
);


ALTER TABLE public.inventories OWNER TO postgres;

--
-- Name: inventories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.inventories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.inventories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    discount_percentage double precision,
    order_id character varying(255),
    original_price double precision,
    price double precision NOT NULL,
    product_id bigint,
    product_name character varying(1000),
    quantity integer NOT NULL,
    vendor_id bigint
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    coupon_code character varying(255),
    coupon_discount double precision NOT NULL,
    date character varying(255),
    delivery_address character varying(1000),
    feedback_comment character varying(255),
    feedback_rating integer,
    order_id character varying(255),
    payment_method character varying(255),
    payment_status character varying(255),
    razorpay_order_id character varying(255),
    razorpay_payment_id character varying(255),
    recipient_name character varying(255),
    recipient_phone character varying(255),
    status character varying(255),
    total_amount double precision NOT NULL,
    user_id bigint
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_coupons (
    id bigint NOT NULL,
    coupon_code character varying(255) NOT NULL,
    product_id bigint NOT NULL
);


ALTER TABLE public.product_coupons OWNER TO postgres;

--
-- Name: product_coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_coupons ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.product_coupons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    product_id bigint NOT NULL,
    image_url text
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    brand character varying(255),
    category character varying(255),
    coupons_enabled boolean NOT NULL,
    description text,
    discount_percentage double precision,
    final_price double precision,
    image_url text,
    name character varying(1000),
    price double precision NOT NULL,
    rejection_reason character varying(255),
    return_policy character varying(255),
    status character varying(255),
    stock integer,
    vendor_id bigint
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.products ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refunds (
    id bigint NOT NULL,
    admin_notes character varying(1000),
    amount double precision NOT NULL,
    customer_notes character varying(1000),
    customer_proof_image character varying(2000),
    order_id character varying(255) NOT NULL,
    processed_at character varying(255),
    razorpay_payment_id character varying(255),
    razorpay_refund_id character varying(255),
    reason character varying(1000),
    requested_at character varying(255),
    resolution_type character varying(255),
    return_reason_category character varying(255),
    return_stage character varying(255),
    status character varying(255),
    warehouse_inspection_image character varying(2000)
);


ALTER TABLE public.refunds OWNER TO postgres;

--
-- Name: refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.refunds ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refunds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    comment character varying(255),
    date character varying(255),
    product_id bigint,
    rating integer NOT NULL,
    reviewer_name character varying(255),
    user_id bigint
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: settlements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlements (
    id bigint NOT NULL,
    commission_amount double precision NOT NULL,
    commission_percentage double precision NOT NULL,
    created_at character varying(255),
    gross_amount double precision NOT NULL,
    net_payout_amount double precision NOT NULL,
    order_id character varying(255) NOT NULL,
    order_item_id bigint,
    product_name character varying(1000),
    settled_at character varying(255),
    status character varying(255),
    vendor_id bigint NOT NULL
);


ALTER TABLE public.settlements OWNER TO postgres;

--
-- Name: settlements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.settlements ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.settlements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_transfers (
    id bigint NOT NULL,
    courier_partner character varying(255),
    created_at timestamp(6) without time zone,
    dispatched_at timestamp(6) without time zone,
    notes character varying(2000),
    quantity integer NOT NULL,
    received_at timestamp(6) without time zone,
    status character varying(255),
    tracking_number character varying(255),
    transfer_number character varying(255) NOT NULL,
    transfer_reason character varying(255),
    destination_warehouse_id bigint,
    product_id bigint,
    source_warehouse_id bigint,
    source_origin character varying(255),
    source_vendor_name character varying(255)
);


ALTER TABLE public.stock_transfers OWNER TO postgres;

--
-- Name: stock_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.stock_transfers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.stock_transfers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_addresses (
    id bigint NOT NULL,
    address_type character varying(255),
    city character varying(255),
    full_name character varying(255),
    is_default boolean,
    phone character varying(255),
    postal_code character varying(255),
    state character varying(255),
    street_address character varying(255),
    user_id bigint
);


ALTER TABLE public.user_addresses OWNER TO postgres;

--
-- Name: user_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_addresses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_addresses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    address character varying(255),
    commission_rate double precision,
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(255),
    role character varying(255) NOT NULL,
    vendor_code character varying(255),
    warehouse_id bigint,
    warehouse_name character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vendor_coupon_approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_coupon_approvals (
    id bigint NOT NULL,
    coupon_code character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    vendor_id bigint NOT NULL
);


ALTER TABLE public.vendor_coupon_approvals OWNER TO postgres;

--
-- Name: vendor_coupon_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.vendor_coupon_approvals ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.vendor_coupon_approvals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: warehouse_allocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouse_allocations (
    id bigint NOT NULL,
    courier_partner character varying(255),
    order_id character varying(255),
    order_item_id bigint,
    packaging_type character varying(255),
    product_id bigint,
    quantity integer NOT NULL,
    status character varying(255),
    tracking_number character varying(255),
    updated_at timestamp(6) without time zone,
    warehouse_id bigint
);


ALTER TABLE public.warehouse_allocations OWNER TO postgres;

--
-- Name: warehouse_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.warehouse_allocations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.warehouse_allocations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id bigint NOT NULL,
    active boolean NOT NULL,
    address character varying(255),
    city character varying(255),
    code character varying(255),
    name character varying(255)
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.warehouses ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.warehouses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    id bigint NOT NULL,
    product_id bigint,
    user_id bigint
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wishlist_items ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.wishlist_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usages (id, coupon_code, discount_amount, order_id, usage_date_time, user_email, user_id) FROM stdin;
1	SAVE20	1037.82	ORD-839090	2026-09-04 14:26:43.822487	anirbansasmal21@gmail.com	1
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, active, code, discount_type, discount_value, expiry_date, max_discount, min_order_amount, start_date, usage_count, usage_limit) FROM stdin;
1	t	SAVE20	PERCENTAGE	20	2026-09-07 23:59:00	\N	1000	2026-08-31 19:14:00	1	1
\.


--
-- Data for Name: inbound_shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inbound_shipments (id, bin_location, courier_partner, created_at, damaged_quantity, declared_quantity, grn_number, received_at, received_quantity, shelved_at, shipment_number, shipped_at, staff_inspection_notes, status, tracking_number, vendor_id, vendor_name, vendor_notes, product_id, warehouse_id) FROM stdin;
\.


--
-- Data for Name: inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventories (id, allocated, bin_location, damaged_quantity, quantity, product_id, warehouse_id) FROM stdin;
1	0	BIN-GEN-01	1	400	1	1
5	0	BIN-GEN-01	1	1200	2	1
14	0	BIN-GEN-01	0	400	4	2
15	0	BIN-GEN-01	0	400	4	3
16	0	BIN-GEN-01	0	400	4	4
17	0	BIN-GEN-01	0	400	6	1
18	0	BIN-GEN-01	0	400	6	2
19	0	BIN-GEN-01	0	400	6	3
20	0	BIN-GEN-01	0	400	6	4
21	0	BIN-GEN-01	0	200	5	1
22	0	BIN-GEN-01	0	200	5	2
23	0	BIN-GEN-01	0	200	5	3
24	0	BIN-GEN-01	0	200	5	4
25	0	BIN-GEN-01	0	200	7	1
26	0	BIN-GEN-01	0	200	7	2
27	0	BIN-GEN-01	0	200	7	3
28	0	BIN-GEN-01	0	200	7	4
29	0	BIN-GEN-01	0	400	8	1
30	0	BIN-GEN-01	0	400	8	2
31	0	BIN-GEN-01	0	400	8	3
32	0	BIN-GEN-01	0	400	8	4
33	0	BIN-GEN-01	0	200	9	1
34	0	BIN-GEN-01	0	200	9	2
35	0	BIN-GEN-01	0	200	9	3
36	0	BIN-GEN-01	0	200	9	4
2	0	BIN-GEN-01	0	400	1	2
3	0	BIN-GEN-01	0	400	1	3
4	0	BIN-GEN-01	0	400	1	4
6	0	BIN-GEN-01	0	1200	2	2
7	0	BIN-GEN-01	0	1200	2	3
8	0	BIN-GEN-01	0	1200	2	4
9	0	BIN-GEN-01	1	800	3	1
10	0	BIN-GEN-01	0	800	3	2
11	0	BIN-GEN-01	0	800	3	3
12	0	BIN-GEN-01	0	800	3	4
13	0	BIN-GEN-01	0	400	4	1
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, discount_percentage, order_id, original_price, price, product_id, product_name, quantity, vendor_id) FROM stdin;
1	5	ORD-554554	43999	41799.05	1	IQOO NEO 10 5G	1	2
2	5	ORD-500165	59999	56999.05	3	Apple watch series 11	1	2
3	3	ORD-630929	10999	10669.03	2	HyperX Headset	1	2
7	10	ORD-854537	159999	143999.1	4	Iphone 17 Pro Max	1	2
11	2	ORD-839090	5295	5189.1	8	Nike Mens Air Monarch IV	1	2
19	5	ORD-154636	43999	41799.05	1	IQOO NEO 10 5G	1	2
24	3	ORD-419473	10999	10669.03	2	HyperX Headset	1	2
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, coupon_code, coupon_discount, date, delivery_address, feedback_comment, feedback_rating, order_id, payment_method, payment_status, razorpay_order_id, razorpay_payment_id, recipient_name, recipient_phone, status, total_amount, user_id) FROM stdin;
3	\N	0	Aug 31, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-630929	RAZORPAY	REFUNDED	order_TWOgsvFH1ifHUk	pay_TWOh2Nq3y4Pqfu	Anirban Sasmal	+919382269878	REFUNDED	10669.03	1
1	\N	0	Aug 29, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-554554	RAZORPAY	REFUNDED	order_TVZlQC6Scr2k4i	pay_TVZlXB0LeL4mkX	Anirban Sasmal	+919382269878	REFUNDED	41799.05	1
2	\N	0	Aug 29, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-500165	RAZORPAY	REFUNDED	order_TVb3eT9xEtbVSa	pay_TVb3mwSY60IzRF	Anirban Sasmal	+919382269878	REFUNDED	56999.05	1
22	\N	0	Sep 10, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-154636	RAZORPAY	REFUNDED	order_TaKxiFNiYHmoHv	pay_TaKxrT5bmnIjTZ	Anirban Sasmal	+919382269878	REFUNDED	41799.05	1
7	\N	0	Sep 04, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-854537	RAZORPAY	REFUNDED	order_TXsCCSWIOH6iNB	pay_TXsCKWWWhgH7ML	Anirban Sasmal	+919382269878	REFUNDED	143999.1	1
11	SAVE20	1037.82	Sep 04, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-839090	RAZORPAY	PAID	order_TXtx9k6zsAlBth	pay_TXtxHHICsXjKUi	Anirban Sasmal	+919382269878	CONFIRMED	4151.28	1
29	\N	0	Sep 10, 2026	Barrackpore, Bara kanthaliya, 700121	\N	\N	ORD-419473	RAZORPAY	REFUNDED	order_TaLAG81CyFp4K6	pay_TaLALs3xTqDBCk	Anirban Sasmal	9382269878	REFUNDED	10669.03	2
\.


--
-- Data for Name: product_coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_coupons (id, coupon_code, product_id) FROM stdin;
1	SAVE20	1
2	SAVE20	4
3	SAVE20	6
4	SAVE20	5
5	SAVE20	7
6	SAVE20	8
7	SAVE20	3
8	SAVE20	2
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (product_id, image_url) FROM stdin;
1	http://localhost:8080/uploads/products/1788003530043_84073b3d_neo-10-i2405-iqoo-original-imahn6vrgkzyydgw.webp
1	http://localhost:8080/uploads/products/1788003530099_322e711f_neo-10-i2405-iqoo-original-imahn66fbdzsfagc.webp
1	http://localhost:8080/uploads/products/1788003530105_0462e1cf_neo-10-i2405-iqoo-original-imahn67hhzagpv4f.webp
1	http://localhost:8080/uploads/products/1788003530113_67189359_neo-10-i2405-iqoo-original-imahn67hzzftpand.webp
1	http://localhost:8080/uploads/products/1788003530117_a502eddb_neo-10-i2405-iqoo-original-imahn68ad8gahx9h.webp
2	http://localhost:8080/uploads/products/1788006946101_b612460e_51GrV_uK6gL._SL1080_.jpg
2	http://localhost:8080/uploads/products/1788006946135_bd730cf6_61aWPnJZDoL._SL1080_.jpg
2	http://localhost:8080/uploads/products/1788006946142_f287de65_61B98PewkeL._SL1080_.jpg
2	http://localhost:8080/uploads/products/1788006946146_6fde5b93_61BbyDzrMRL._SL1080_.jpg
2	http://localhost:8080/uploads/products/1788006946148_862c69f5_61K_UQK4rVL._SL1080_.jpg
2	http://localhost:8080/uploads/products/1788006946153_4dcbc4b1_71uRUGb3ODL._SL1080_.jpg
2	http://localhost:8080/uploads/products/1788006946158_f736a5f8_71XI8ExzqGL._SL1080_.jpg
3	http://localhost:8080/uploads/products/1788007024133_0566d5fb_61CeNxIal1L._SL1500_.jpg
3	http://localhost:8080/uploads/products/1788007024137_bde7eadc_71FEhs8wFcL._SL1500_.jpg
3	http://localhost:8080/uploads/products/1788007024140_481b93f9_71js8OjkSIL._SL1500_.jpg
3	http://localhost:8080/uploads/products/1788007024143_fd9d8c43_71PmhnqgDFL._SL1500_.jpg
3	http://localhost:8080/uploads/products/1788007024150_efb7c47e_71Vdab7o2UL._SL1500_.jpg
3	http://localhost:8080/uploads/products/1788007024153_c990e154_81_MP3SglmL._SL1500_.jpg
4	http://localhost:8080/uploads/products/1788007128001_b6a71543_71g5oEE256L._SL1500_.jpg
4	http://localhost:8080/uploads/products/1788007128005_aab302af_71JGCn1z1TL._SL1500_.jpg
4	http://localhost:8080/uploads/products/1788007128012_1dc1d230_71zwfwSC3EL._SL1500_.jpg
4	http://localhost:8080/uploads/products/1788007128018_5b7c7cf4_81MxB61jptL._SL1500_.jpg
4	http://localhost:8080/uploads/products/1788007128021_cf1cb72e_917GUQT35bL._SL1500_.jpg
4	http://localhost:8080/uploads/products/1788007128027_4f8382c9_7174ij6XcNL._SL1500_.jpg
5	http://localhost:8080/uploads/products/1788007201769_0fe069e1_51bUOSEMDeL._SL1171_.jpg
5	http://localhost:8080/uploads/products/1788007201774_bfc6b48e_51hSCqzg7qL._SL1145_.jpg
5	http://localhost:8080/uploads/products/1788007201779_0be57467_51w0RubSG7L.jpg
6	http://localhost:8080/uploads/products/1788007382834_c07cb9a6_61Rq2G4xnwL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382838_f8cf6637_71cfEvmy9gL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382842_d2a3fc7b_71EDDVzq2aL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382843_0a4032a6_71ngtCW9eEL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382846_64cbdc02_71pGTkpRthL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382852_f47cbcbd_71rARPCThjL._SL1201_.jpg
6	http://localhost:8080/uploads/products/1788007382858_58402284_81cBLzpF8jL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382863_47be1843_81jsPeTd_rL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382865_95626227_81K3kKpV75L._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382871_9fc63f39_81Md8hf0CKL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382878_86ca59ee_81oiRo6JioL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382884_6fb08835_81sxOXZAF6L._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382890_507727c9_81tOcArigOL._SL1500_.jpg
6	http://localhost:8080/uploads/products/1788007382895_822b8255_817DZXcRbyL._SL1500_.jpg
7	http://localhost:8080/uploads/products/1788007472631_df3bac52_61_jOMbYhYL._SL1500_.jpg
7	http://localhost:8080/uploads/products/1788007472638_3f1d3cdb_61koBlwf8bL._SL1500_.jpg
7	http://localhost:8080/uploads/products/1788007472642_b5abb579_81MRaOQpuOL._SL1500_.jpg
7	http://localhost:8080/uploads/products/1788007472644_a280247e_81o6je0ACSL._SL1500_.jpg
7	http://localhost:8080/uploads/products/1788007472649_a10e79a7_611tGygBGrL._SL1500_.jpg
7	http://localhost:8080/uploads/products/1788007472654_0227ad5e_613rnwLRKNL._SL1500_.jpg
8	http://localhost:8080/uploads/products/1788007670950_8cc9f35a_61CzrROwU3L._AC_SL1500_.jpg
8	http://localhost:8080/uploads/products/1788007670955_4105fbd0_61k8isBfmBL._AC_SL1500_.jpg
8	http://localhost:8080/uploads/products/1788007670961_652b2951_61WRqktDDGL._AC_SL1500_.jpg
8	http://localhost:8080/uploads/products/1788007670964_0e249185_61YDY4oba6L._AC_SL1500_.jpg
8	http://localhost:8080/uploads/products/1788007670967_4567ed1c_71EfKxvB8KL._AC_SL1500_.jpg
8	http://localhost:8080/uploads/products/1788007670974_c965a9e2_71J9ADf7TOL._AC_SL1500_.jpg
8	http://localhost:8080/uploads/products/1788007670982_7fd8978c_716d1tfrNYL._AC_SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058781_128456f6_61f8Co8YS2L._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058832_55fa3d15_71NOFb0xV5L._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058838_91065592_71PwnYgkm7L._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058849_bc0d260d_71xEexA5XXL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058856_153eb917_71y3vWWOAXL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058861_f9021f5f_81aRTQK23SL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058864_d9473c2b_81AxLeJng-L._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058873_233f442d_81H2sjstUeL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058877_81b3e427_81LrJehFDsL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058886_fb1c6573_81Md8hf0CKL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058894_facb60eb_81OQ-ch45BL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058904_47d894d2_81PfuZsV8WL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058910_55785727_81wtb5XYFJL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058917_30216153_711Vs-a04jL._SL1500_.jpg
9	http://localhost:8080/uploads/products/1788184058926_a1c6b690_818SQrtNerL._SL1500_.jpg
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, brand, category, coupons_enabled, description, discount_percentage, final_price, image_url, name, price, rejection_reason, return_policy, status, stock, vendor_id) FROM stdin;
8	NIKE	Fashion	t	NEW ARRIVAL	2	5189.1	http://localhost:8080/uploads/products/1788007670955_4105fbd0_61k8isBfmBL._AC_SL1500_.jpg	Nike Mens Air Monarch IV	5295	\N	7_DAYS	APPROVED	1600	2
9	ASUS	Electronics	t	AMD Ryzen AI Z2 Extreme Processor,24GB RAM, 1TB SSD,7"/17.8cm, FHD,Touchscreen,120Hz, 500 nits,Win 11 Home, Black,715g,RC73XA-NH016W,AMD Radeon Graphics,Gaming Handheld PC	10	134100	http://localhost:8080/uploads/products/1788184058781_128456f6_61f8Co8YS2L._SL1500_.jpg	ASUS ROG XBOX Ally X (2025)	149000	\N	7_DAYS	APPROVED	800	2
3	APPLE	Electronics	t	Smart Watch	5	56999.05	http://localhost:8080/uploads/products/1788007024140_481b93f9_71js8OjkSIL._SL1500_.jpg	Apple watch series 11	59999	\N	7_DAYS	APPROVED	3200	2
4	Apple	Electronics	t	Smart phone	10	143999.1	http://localhost:8080/uploads/products/1788007128005_aab302af_71JGCn1z1TL._SL1500_.jpg	Iphone 17 Pro Max	159999	\N	7_DAYS	APPROVED	1600	2
6	ASUS	Electronics	t	RTX 5090 , gaming laptop	5	445549.05	http://localhost:8080/uploads/products/1788007382834_c07cb9a6_61Rq2G4xnwL._SL1500_.jpg	ASUS ROG Strix scar 18	468999	\N	7_DAYS	APPROVED	1600	2
5	SONY	Electronics	t	New gaming play station	3	58199.03	http://localhost:8080/uploads/products/1788007201779_0be57467_51w0RubSG7L.jpg	Play Station 5 pro	59999	\N	7_DAYS	APPROVED	800	2
7	Apple	Electronics	t	New launch Mac book	5	243199.05	http://localhost:8080/uploads/products/1788007472631_df3bac52_61_jOMbYhYL._SL1500_.jpg	Mac Book Pro M5	255999	\N	7_DAYS	APPROVED	800	2
1	IQOO	Electronics	t	GAMING BEAST	5	41799.05	http://localhost:8080/uploads/products/1788003530043_84073b3d_neo-10-i2405-iqoo-original-imahn6vrgkzyydgw.webp	IQOO NEO 10 5G	43999	\N	7_DAYS	APPROVED	1600	2
2	HYPER X	Electronics	t	GAMING HEADSET	3	10669.03	http://localhost:8080/uploads/products/1788006946101_b612460e_51GrV_uK6gL._SL1080_.jpg	HyperX Headset	10999	\N	7_DAYS	APPROVED	4800	2
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refunds (id, admin_notes, amount, customer_notes, customer_proof_image, order_id, processed_at, razorpay_payment_id, razorpay_refund_id, reason, requested_at, resolution_type, return_reason_category, return_stage, status, warehouse_inspection_image) FROM stdin;
1	Quality inspection passed. Item returned in resellable/acceptable condition.	41799.05			ORD-554554	Aug 29, 2026 17:26	pay_TVZlXB0LeL4mkX	rfnd_TVZowpQUNw5fyg	Defective or damaged item received	Aug 29, 2026 17:25	REFUND	DEFECTIVE_DAMAGED	REFUNDED	PROCESSED	
2	Quality inspection passed. Item returned in resellable/acceptable condition.	56999.05			ORD-500165	Aug 29, 2026 18:42	pay_TVb3mwSY60IzRF	rfnd_TVb6YG7cBnlcAt	Defective or damaged item received	Aug 29, 2026 18:41	REFUND	DEFECTIVE_DAMAGED	REFUNDED	PROCESSED	
10	Quality inspection passed. Item returned in resellable/acceptable condition.	41799.05			ORD-154636	Sep 10, 2026 18:30	pay_TaKxrT5bmnIjTZ	rfnd_TaLJTRUqqDBfb3	Wrong item delivered by seller	Sep 10, 2026 18:29	REFUND	WRONG_ITEM	REFUNDED	PROCESSED	
3	Quality inspection passed. Item returned in resellable/acceptable condition.	10669.03			ORD-630929	Aug 31, 2026 19:20	pay_TWOh2Nq3y4Pqfu	rfnd_TWOpLcIvrqKXS2	Defective or damaged item received	Aug 31, 2026 19:19	REFUND	DEFECTIVE_DAMAGED	REFUNDED	PROCESSED	
12	Quality inspection passed. Item returned in resellable/acceptable condition.	10669.03			ORD-419473	Sep 10, 2026 18:40	pay_TaLALs3xTqDBCk	rfnd_TaLUkYWZ0IKMB8	Wrong item delivered by seller	Sep 10, 2026 18:39	REFUND	WRONG_ITEM	REFUNDED	PROCESSED	
4	Quality inspection passed. Item returned in resellable/acceptable condition.	143999.1			ORD-854537	Sep 04, 2026 13:33	pay_TXsCKWWWhgH7ML	rfnd_TXt2ltu3kCn5J6	Wrong item delivered by seller	Sep 04, 2026 13:31	REFUND	WRONG_ITEM	REFUNDED	PROCESSED	
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, comment, date, product_id, rating, reviewer_name, user_id) FROM stdin;
\.


--
-- Data for Name: settlements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settlements (id, commission_amount, commission_percentage, created_at, gross_amount, net_payout_amount, order_id, order_item_id, product_name, settled_at, status, vendor_id) FROM stdin;
1	4179.91	10	Aug 29, 2026	41799.05	37619.14	ORD-554554	1	IQOO NEO 10 5G	\N	REFUNDED	2
2	5699.91	10	Aug 29, 2026	56999.05	51299.14	ORD-500165	2	Apple watch series 11	\N	REFUNDED	2
3	1066.9	10	Aug 31, 2026	10669.03	9602.13	ORD-630929	3	HyperX Headset	\N	REFUNDED	2
4	14399.91	10	Sep 04, 2026	143999.1	129599.19	ORD-854537	7	Iphone 17 Pro Max	\N	REFUNDED	2
8	518.91	10	Sep 04, 2026	5189.1	4670.19	ORD-839090	11	Nike Mens Air Monarch IV	\N	PENDING	2
16	4179.91	10	Sep 10, 2026	41799.05	37619.14	ORD-154636	19	IQOO NEO 10 5G	\N	REFUNDED	2
21	1066.9	10	Sep 10, 2026	10669.03	9602.13	ORD-419473	24	HyperX Headset	\N	REFUNDED	2
\.


--
-- Data for Name: stock_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_transfers (id, courier_partner, created_at, dispatched_at, notes, quantity, received_at, status, tracking_number, transfer_number, transfer_reason, destination_warehouse_id, product_id, source_warehouse_id, source_origin, source_vendor_name) FROM stdin;
1	\N	2026-08-29 18:19:06.326628	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	300	2026-08-29 18:19:06.329918	RECEIVED_AND_SHELVED	\N	DIST-2026-74947	VENDOR_STOCK_DISTRIBUTION	1	2	\N	VENDOR	Vendor Listed Stock
2	\N	2026-08-29 18:19:06.357164	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	300	2026-08-29 18:19:06.35918	RECEIVED_AND_SHELVED	\N	DIST-2026-87334	VENDOR_STOCK_DISTRIBUTION	2	2	\N	VENDOR	Vendor Listed Stock
3	\N	2026-08-29 18:19:06.377976	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	300	2026-08-29 18:19:06.381146	RECEIVED_AND_SHELVED	\N	DIST-2026-47465	VENDOR_STOCK_DISTRIBUTION	3	2	\N	VENDOR	Vendor Listed Stock
4	\N	2026-08-29 18:19:06.39926	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	300	2026-08-29 18:19:06.402412	RECEIVED_AND_SHELVED	\N	DIST-2026-68405	VENDOR_STOCK_DISTRIBUTION	4	2	\N	VENDOR	Vendor Listed Stock
5	\N	2026-08-29 18:19:27.838401	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:19:27.841695	RECEIVED_AND_SHELVED	\N	DIST-2026-14832	VENDOR_STOCK_DISTRIBUTION	1	3	\N	VENDOR	Vendor Listed Stock
6	\N	2026-08-29 18:19:27.859391	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:19:27.860688	RECEIVED_AND_SHELVED	\N	DIST-2026-57456	VENDOR_STOCK_DISTRIBUTION	2	3	\N	VENDOR	Vendor Listed Stock
7	\N	2026-08-29 18:19:27.879344	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:19:27.881549	RECEIVED_AND_SHELVED	\N	DIST-2026-34133	VENDOR_STOCK_DISTRIBUTION	3	3	\N	VENDOR	Vendor Listed Stock
8	\N	2026-08-29 18:19:27.900548	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:19:27.902855	RECEIVED_AND_SHELVED	\N	DIST-2026-34154	VENDOR_STOCK_DISTRIBUTION	4	3	\N	VENDOR	Vendor Listed Stock
9	\N	2026-08-29 18:20:03.874968	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:03.877188	RECEIVED_AND_SHELVED	\N	DIST-2026-48987	VENDOR_STOCK_DISTRIBUTION	1	4	\N	VENDOR	Vendor Listed Stock
10	\N	2026-08-29 18:20:03.894513	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:03.896723	RECEIVED_AND_SHELVED	\N	DIST-2026-50259	VENDOR_STOCK_DISTRIBUTION	2	4	\N	VENDOR	Vendor Listed Stock
11	\N	2026-08-29 18:20:03.915218	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:03.917581	RECEIVED_AND_SHELVED	\N	DIST-2026-47161	VENDOR_STOCK_DISTRIBUTION	3	4	\N	VENDOR	Vendor Listed Stock
12	\N	2026-08-29 18:20:03.936011	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:03.93802	RECEIVED_AND_SHELVED	\N	DIST-2026-49873	VENDOR_STOCK_DISTRIBUTION	4	4	\N	VENDOR	Vendor Listed Stock
13	\N	2026-08-29 18:20:28.614312	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:28.615334	RECEIVED_AND_SHELVED	\N	DIST-2026-11620	VENDOR_STOCK_DISTRIBUTION	1	6	\N	VENDOR	Vendor Listed Stock
14	\N	2026-08-29 18:20:28.631611	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:28.633869	RECEIVED_AND_SHELVED	\N	DIST-2026-22490	VENDOR_STOCK_DISTRIBUTION	2	6	\N	VENDOR	Vendor Listed Stock
15	\N	2026-08-29 18:20:28.650462	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:28.652623	RECEIVED_AND_SHELVED	\N	DIST-2026-95621	VENDOR_STOCK_DISTRIBUTION	3	6	\N	VENDOR	Vendor Listed Stock
16	\N	2026-08-29 18:20:28.671057	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:20:28.674117	RECEIVED_AND_SHELVED	\N	DIST-2026-85778	VENDOR_STOCK_DISTRIBUTION	4	6	\N	VENDOR	Vendor Listed Stock
17	\N	2026-08-29 18:20:42.106703	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:42.108804	RECEIVED_AND_SHELVED	\N	DIST-2026-26216	VENDOR_STOCK_DISTRIBUTION	1	5	\N	VENDOR	Vendor Listed Stock
18	\N	2026-08-29 18:20:42.125851	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:42.126991	RECEIVED_AND_SHELVED	\N	DIST-2026-82538	VENDOR_STOCK_DISTRIBUTION	2	5	\N	VENDOR	Vendor Listed Stock
19	\N	2026-08-29 18:20:42.147215	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:42.149492	RECEIVED_AND_SHELVED	\N	DIST-2026-41650	VENDOR_STOCK_DISTRIBUTION	3	5	\N	VENDOR	Vendor Listed Stock
20	\N	2026-08-29 18:20:42.168501	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:42.169878	RECEIVED_AND_SHELVED	\N	DIST-2026-73367	VENDOR_STOCK_DISTRIBUTION	4	5	\N	VENDOR	Vendor Listed Stock
21	\N	2026-08-29 18:20:51.180753	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:51.183193	RECEIVED_AND_SHELVED	\N	DIST-2026-14066	VENDOR_STOCK_DISTRIBUTION	1	7	\N	VENDOR	Vendor Listed Stock
22	\N	2026-08-29 18:20:51.198418	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:51.199981	RECEIVED_AND_SHELVED	\N	DIST-2026-56686	VENDOR_STOCK_DISTRIBUTION	2	7	\N	VENDOR	Vendor Listed Stock
23	\N	2026-08-29 18:20:51.216168	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:51.218176	RECEIVED_AND_SHELVED	\N	DIST-2026-72885	VENDOR_STOCK_DISTRIBUTION	3	7	\N	VENDOR	Vendor Listed Stock
24	\N	2026-08-29 18:20:51.235229	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-29 18:20:51.237544	RECEIVED_AND_SHELVED	\N	DIST-2026-24216	VENDOR_STOCK_DISTRIBUTION	4	7	\N	VENDOR	Vendor Listed Stock
25	\N	2026-08-29 18:21:01.995018	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:21:01.997254	RECEIVED_AND_SHELVED	\N	DIST-2026-23374	VENDOR_STOCK_DISTRIBUTION	1	8	\N	VENDOR	Vendor Listed Stock
26	\N	2026-08-29 18:21:02.0102	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:21:02.012322	RECEIVED_AND_SHELVED	\N	DIST-2026-10813	VENDOR_STOCK_DISTRIBUTION	2	8	\N	VENDOR	Vendor Listed Stock
27	\N	2026-08-29 18:21:02.024932	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:21:02.026057	RECEIVED_AND_SHELVED	\N	DIST-2026-28514	VENDOR_STOCK_DISTRIBUTION	3	8	\N	VENDOR	Vendor Listed Stock
28	\N	2026-08-29 18:21:02.039954	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-08-29 18:21:02.041012	RECEIVED_AND_SHELVED	\N	DIST-2026-66370	VENDOR_STOCK_DISTRIBUTION	4	8	\N	VENDOR	Vendor Listed Stock
29	\N	2026-08-31 19:18:41.849574	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-31 19:18:41.853218	RECEIVED_AND_SHELVED	\N	DIST-2026-46724	VENDOR_STOCK_DISTRIBUTION	1	9	\N	VENDOR	Vendor Listed Stock
30	\N	2026-08-31 19:18:41.867352	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-31 19:18:41.86886	RECEIVED_AND_SHELVED	\N	DIST-2026-24607	VENDOR_STOCK_DISTRIBUTION	2	9	\N	VENDOR	Vendor Listed Stock
31	\N	2026-08-31 19:18:41.880006	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-31 19:18:41.881008	RECEIVED_AND_SHELVED	\N	DIST-2026-14656	VENDOR_STOCK_DISTRIBUTION	3	9	\N	VENDOR	Vendor Listed Stock
32	\N	2026-08-31 19:18:41.893185	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	100	2026-08-31 19:18:41.894182	RECEIVED_AND_SHELVED	\N	DIST-2026-44617	VENDOR_STOCK_DISTRIBUTION	4	9	\N	VENDOR	Vendor Listed Stock
33	\N	2026-09-04 12:39:50.138294	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-09-04 12:39:50.140108	RECEIVED_AND_SHELVED	\N	DIST-2026-75250	VENDOR_STOCK_DISTRIBUTION	1	1	\N	VENDOR	Vendor Listed Stock
34	\N	2026-09-04 12:39:50.221551	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-09-04 12:39:50.221551	RECEIVED_AND_SHELVED	\N	DIST-2026-21400	VENDOR_STOCK_DISTRIBUTION	2	1	\N	VENDOR	Vendor Listed Stock
35	\N	2026-09-04 12:39:50.250952	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-09-04 12:39:50.250952	RECEIVED_AND_SHELVED	\N	DIST-2026-56086	VENDOR_STOCK_DISTRIBUTION	3	1	\N	VENDOR	Vendor Listed Stock
36	\N	2026-09-04 12:39:50.266685	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	200	2026-09-04 12:39:50.271016	RECEIVED_AND_SHELVED	\N	DIST-2026-54024	VENDOR_STOCK_DISTRIBUTION	4	1	\N	VENDOR	Vendor Listed Stock
37	\N	2026-09-04 12:40:06.390141	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	600	2026-09-04 12:40:06.392372	RECEIVED_AND_SHELVED	\N	DIST-2026-56429	VENDOR_STOCK_DISTRIBUTION	1	2	\N	VENDOR	Vendor Listed Stock
38	\N	2026-09-04 12:40:06.3959	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	600	2026-09-04 12:40:06.3959	RECEIVED_AND_SHELVED	\N	DIST-2026-23720	VENDOR_STOCK_DISTRIBUTION	2	2	\N	VENDOR	Vendor Listed Stock
39	\N	2026-09-04 12:40:06.41176	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	600	2026-09-04 12:40:06.41176	RECEIVED_AND_SHELVED	\N	DIST-2026-63513	VENDOR_STOCK_DISTRIBUTION	3	2	\N	VENDOR	Vendor Listed Stock
40	\N	2026-09-04 12:40:06.42755	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	600	2026-09-04 12:40:06.443341	RECEIVED_AND_SHELVED	\N	DIST-2026-55955	VENDOR_STOCK_DISTRIBUTION	4	2	\N	VENDOR	Vendor Listed Stock
41	\N	2026-09-04 12:40:18.261855	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	400	2026-09-04 12:40:18.263861	RECEIVED_AND_SHELVED	\N	DIST-2026-76063	VENDOR_STOCK_DISTRIBUTION	1	3	\N	VENDOR	Vendor Listed Stock
42	\N	2026-09-04 12:40:18.275052	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	400	2026-09-04 12:40:18.275052	RECEIVED_AND_SHELVED	\N	DIST-2026-36932	VENDOR_STOCK_DISTRIBUTION	2	3	\N	VENDOR	Vendor Listed Stock
43	\N	2026-09-04 12:40:18.290874	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	400	2026-09-04 12:40:18.290874	RECEIVED_AND_SHELVED	\N	DIST-2026-42071	VENDOR_STOCK_DISTRIBUTION	3	3	\N	VENDOR	Vendor Listed Stock
44	\N	2026-09-04 12:40:18.306663	\N	Admin distributes vendor listed catalog stock across regional fulfillment centers.	400	2026-09-04 12:40:18.306663	RECEIVED_AND_SHELVED	\N	DIST-2026-92266	VENDOR_STOCK_DISTRIBUTION	4	3	\N	VENDOR	Vendor Listed Stock
\.


--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_addresses (id, address_type, city, full_name, is_default, phone, postal_code, state, street_address, user_id) FROM stdin;
1	HOME	Barrackpore	Anirban Sasmal	t	+919382269878	700121	West Bengal	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, address, commission_rate, email, full_name, password, phone, role, vendor_code, warehouse_id, warehouse_name) FROM stdin;
1	\N	\N	anirbansasmal21@gmail.com	Anirban Customer	Anirban@021	\N	CUSTOMER	\N	\N	
4	\N	\N	anirban14kolkata@staff	Anirban Staff1	Anirban@0021	\N	WAREHOUSE_STAFF	\N	1	Kolkata Regional Fulfillment Hub (WH-KOL-01)
5	\N	\N	anirban14delhi@staff	Anirban Staff2	Anirban@0069	\N	WAREHOUSE_STAFF	\N	3	Delhi NCR Fulfillment Center (WH-DEL-03)
6	\N	\N	anirban14mumbai@staff	Anirban Staff3	Anirban@014	\N	WAREHOUSE_STAFF	\N	2	Mumbai Central Warehouse (WH-MUM-02)
7	\N	\N	anirban15bangalore@staff	Anirban Staff4	Anirban@0096	\N	WAREHOUSE_STAFF	\N	4	Bangalore Logistics Hub (WH-BLR-04)
3	\N	\N	anirbansasmal40@admin	Anirban Admin	Anirban@040	\N	ADMINISTRATOR	\N	\N	
2	\N	\N	anirbansasmal84@gmail.com	Anirban Vendor	Anirban@084	\N	CUSTOMER	414324	\N	
84	\N	\N	agnivagorai745@gmail.com	Nandini 	Nandini@069	\N	CUSTOMER	\N	\N	
85	ShopStack HQ, Tech City	\N	admin@admin	System Administrator	admin123	+91 98765 43210	ADMINISTRATOR	\N	\N	\N
86	Merchant Boulevard, Sector 5	10	seller@seller	Prime Merchant	seller123	+91 98765 11223	VENDOR	123456	\N	\N
87	Salt Lake Sector V, Kolkata	\N	staff@staff	Kolkata Hub Staff	staff123	+91 98765 99887	WAREHOUSE_STAFF	\N	1	Kolkata Regional Fulfillment Hub (WH-KOL-01)
88	12 Park Street, Kolkata	\N	customer@gmail.com	Demo Customer	customer123	+91 98765 00001	CUSTOMER	\N	\N	\N
89	\N	\N	anirbansasmal55@gmail.com	Anirban test	Anirban@055	\N	CUSTOMER	\N	\N	
90	\N	\N	anirbansasmal56@gmail.com	Anirban test2	Anirban@056	\N	CUSTOMER	\N	\N	
91	\N	\N	anirbansasmal57@gmail.com	Anirban3	Anirban@057	\N	CUSTOMER	\N	\N	
\.


--
-- Data for Name: vendor_coupon_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendor_coupon_approvals (id, coupon_code, status, vendor_id) FROM stdin;
1	SAVE20	APPROVED	2
\.


--
-- Data for Name: warehouse_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouse_allocations (id, courier_partner, order_id, order_item_id, packaging_type, product_id, quantity, status, tracking_number, updated_at, warehouse_id) FROM stdin;
1	ShopStack Express	ORD-554554	1	Standard Box	1	1	DELIVERED	AWB-60340835	2026-08-29 17:24:44.483042	1
2	ShopStack Express	ORD-500165	2	Standard Box	3	1	DELIVERED	AWB-37608702	2026-08-29 18:40:52.298117	1
3	ShopStack Express	ORD-630929	3	Standard Box	2	1	DELIVERED	SS-948900	2026-08-31 19:13:54.12324	1
4	ShopStack Express	ORD-854537	7	Standard Box	4	1	DELIVERED	AWB-64919554	2026-09-04 13:31:26.750238	1
5	ShopStack Express	ORD-154636	19	Standard Box	1	1	DELIVERED	AWB-64731839	2026-09-10 18:19:27.960221	1
6	ShopStack Express	ORD-419473	24	Standard Box	2	1	DELIVERED	AWB-50748012	2026-09-10 18:25:09.245401	1
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, active, address, city, code, name) FROM stdin;
1	t	Salt Lake Sector V, Bidhannagar	Kolkata	WH-KOL-01	Kolkata Regional Fulfillment Hub
2	t	12 Industrial Area, Andheri East	Mumbai	WH-MUM-02	Mumbai Central Warehouse
3	t	45 Sector Road, Gurugram	Delhi	WH-DEL-03	Delhi NCR Fulfillment Center
4	t	88 Electronics City Phase 1	Bangalore	WH-BLR-04	Bangalore Logistics Hub
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_items (id, product_id, user_id) FROM stdin;
\.


--
-- Name: coupon_usages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_usages_id_seq', 1, true);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupons_id_seq', 1, true);


--
-- Name: inbound_shipments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inbound_shipments_id_seq', 1, false);


--
-- Name: inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventories_id_seq', 36, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 28, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 35, true);


--
-- Name: product_coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_coupons_id_seq', 8, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 41, true);


--
-- Name: refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refunds_id_seq', 12, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: settlements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settlements_id_seq', 25, true);


--
-- Name: stock_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_transfers_id_seq', 44, true);


--
-- Name: user_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_addresses_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 91, true);


--
-- Name: vendor_coupon_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendor_coupon_approvals_id_seq', 1, true);


--
-- Name: warehouse_allocations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouse_allocations_id_seq', 6, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 4, true);


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlist_items_id_seq', 1, false);


--
-- Name: coupon_usages coupon_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usages
    ADD CONSTRAINT coupon_usages_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: inbound_shipments inbound_shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inbound_shipments
    ADD CONSTRAINT inbound_shipments_pkey PRIMARY KEY (id);


--
-- Name: inventories inventories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT inventories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_coupons product_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_coupons
    ADD CONSTRAINT product_coupons_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: settlements settlements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlements
    ADD CONSTRAINT settlements_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: inbound_shipments uk77tisl4431xy90l49q20ysuow; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inbound_shipments
    ADD CONSTRAINT uk77tisl4431xy90l49q20ysuow UNIQUE (shipment_number);


--
-- Name: coupons ukeplt0kkm9yf2of2lnx6c1oy9b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT ukeplt0kkm9yf2of2lnx6c1oy9b UNIQUE (code);


--
-- Name: stock_transfers ukick25fueer7ic8lpb758bj6b7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT ukick25fueer7ic8lpb758bj6b7 UNIQUE (transfer_number);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendor_coupon_approvals vendor_coupon_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_coupon_approvals
    ADD CONSTRAINT vendor_coupon_approvals_pkey PRIMARY KEY (id);


--
-- Name: warehouse_allocations warehouse_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_allocations
    ADD CONSTRAINT warehouse_allocations_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers fk24aoj1hs71g3vit38m2ut0n3c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk24aoj1hs71g3vit38m2ut0n3c FOREIGN KEY (destination_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: inventories fk8drmqyx629j3oo8ct9jnc5y3y; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT fk8drmqyx629j3oo8ct9jnc5y3y FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_transfers fk8wdmt04gphikujrrpmianl6xw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk8wdmt04gphikujrrpmianl6xw FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: warehouse_allocations fkcq7m8gooevrm6r3lfwcbusveh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouse_allocations
    ADD CONSTRAINT fkcq7m8gooevrm6r3lfwcbusveh FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_transfers fkhenhdgs1hqlktjhe9df0g13yq; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fkhenhdgs1hqlktjhe9df0g13yq FOREIGN KEY (source_warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: inbound_shipments fkly24ftsoa5n2j5x7q85wh14bm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inbound_shipments
    ADD CONSTRAINT fkly24ftsoa5n2j5x7q85wh14bm FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: inventories fkoipfe4s81wodvutx9i0rlmoyi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT fkoipfe4s81wodvutx9i0rlmoyi FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: product_images fkqnq71xsohugpqwf3c9gxmsuy; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fkqnq71xsohugpqwf3c9gxmsuy FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: inbound_shipments fkqpf3n88dutrc0mo4buwrdhkgt; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inbound_shipments
    ADD CONSTRAINT fkqpf3n88dutrc0mo4buwrdhkgt FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 9bsTDipGj5d6Zm5Bk0FBpekhIo7uYjPVAVteTF1PqxtBOuRxYQdrmBE0HDWoawF

