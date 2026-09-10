--
-- PostgreSQL database dump
--

\restrict 3XCeoWfu26hort3cmoT5YUESrkJfVCZ4kIy3arCKEdD1QEIhObEVse5quSbCGxc

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: coupon_usages; Type: TABLE DATA; Schema: public; Owner: postgres
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.coupon_usages DISABLE TRIGGER ALL;

COPY public.coupon_usages (id, coupon_code, discount_amount, order_id, usage_date_time, user_email, user_id) FROM stdin;
1	SAVE20	1037.82	ORD-839090	2026-09-04 14:26:43.822487	anirbansasmal21@gmail.com	1
\.


ALTER TABLE public.coupon_usages ENABLE TRIGGER ALL;

--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.coupons DISABLE TRIGGER ALL;

COPY public.coupons (id, active, code, discount_type, discount_value, expiry_date, max_discount, min_order_amount, start_date, usage_count, usage_limit) FROM stdin;
1	t	SAVE20	PERCENTAGE	20	2026-09-07 23:59:00	\N	1000	2026-08-31 19:14:00	1	1
\.


ALTER TABLE public.coupons ENABLE TRIGGER ALL;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.products DISABLE TRIGGER ALL;

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


ALTER TABLE public.products ENABLE TRIGGER ALL;

--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.warehouses DISABLE TRIGGER ALL;

COPY public.warehouses (id, active, address, city, code, name) FROM stdin;
1	t	Salt Lake Sector V, Bidhannagar	Kolkata	WH-KOL-01	Kolkata Regional Fulfillment Hub
2	t	12 Industrial Area, Andheri East	Mumbai	WH-MUM-02	Mumbai Central Warehouse
3	t	45 Sector Road, Gurugram	Delhi	WH-DEL-03	Delhi NCR Fulfillment Center
4	t	88 Electronics City Phase 1	Bangalore	WH-BLR-04	Bangalore Logistics Hub
\.


ALTER TABLE public.warehouses ENABLE TRIGGER ALL;

--
-- Data for Name: inbound_shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.inbound_shipments DISABLE TRIGGER ALL;

COPY public.inbound_shipments (id, bin_location, courier_partner, created_at, damaged_quantity, declared_quantity, grn_number, received_at, received_quantity, shelved_at, shipment_number, shipped_at, staff_inspection_notes, status, tracking_number, vendor_id, vendor_name, vendor_notes, product_id, warehouse_id) FROM stdin;
\.


ALTER TABLE public.inbound_shipments ENABLE TRIGGER ALL;

--
-- Data for Name: inventories; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.inventories DISABLE TRIGGER ALL;

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


ALTER TABLE public.inventories ENABLE TRIGGER ALL;

--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items DISABLE TRIGGER ALL;

COPY public.order_items (id, discount_percentage, order_id, original_price, price, product_id, product_name, quantity, vendor_id) FROM stdin;
1	5	ORD-554554	43999	41799.05	1	IQOO NEO 10 5G	1	2
2	5	ORD-500165	59999	56999.05	3	Apple watch series 11	1	2
3	3	ORD-630929	10999	10669.03	2	HyperX Headset	1	2
7	10	ORD-854537	159999	143999.1	4	Iphone 17 Pro Max	1	2
11	2	ORD-839090	5295	5189.1	8	Nike Mens Air Monarch IV	1	2
19	5	ORD-154636	43999	41799.05	1	IQOO NEO 10 5G	1	2
24	3	ORD-419473	10999	10669.03	2	HyperX Headset	1	2
\.


ALTER TABLE public.order_items ENABLE TRIGGER ALL;

--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.orders DISABLE TRIGGER ALL;

COPY public.orders (id, coupon_code, coupon_discount, date, delivery_address, feedback_comment, feedback_rating, order_id, payment_method, payment_status, razorpay_order_id, razorpay_payment_id, recipient_name, recipient_phone, status, total_amount, user_id) FROM stdin;
3	\N	0	Aug 31, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-630929	RAZORPAY	REFUNDED	order_TWOgsvFH1ifHUk	pay_TWOh2Nq3y4Pqfu	Anirban Sasmal	+919382269878	REFUNDED	10669.03	1
1	\N	0	Aug 29, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-554554	RAZORPAY	REFUNDED	order_TVZlQC6Scr2k4i	pay_TVZlXB0LeL4mkX	Anirban Sasmal	+919382269878	REFUNDED	41799.05	1
2	\N	0	Aug 29, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-500165	RAZORPAY	REFUNDED	order_TVb3eT9xEtbVSa	pay_TVb3mwSY60IzRF	Anirban Sasmal	+919382269878	REFUNDED	56999.05	1
22	\N	0	Sep 10, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-154636	RAZORPAY	REFUNDED	order_TaKxiFNiYHmoHv	pay_TaKxrT5bmnIjTZ	Anirban Sasmal	+919382269878	REFUNDED	41799.05	1
7	\N	0	Sep 04, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-854537	RAZORPAY	REFUNDED	order_TXsCCSWIOH6iNB	pay_TXsCKWWWhgH7ML	Anirban Sasmal	+919382269878	REFUNDED	143999.1	1
11	SAVE20	1037.82	Sep 04, 2026	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya, Barrackpore, West Bengal - 700121	\N	\N	ORD-839090	RAZORPAY	PAID	order_TXtx9k6zsAlBth	pay_TXtxHHICsXjKUi	Anirban Sasmal	+919382269878	CONFIRMED	4151.28	1
29	\N	0	Sep 10, 2026	Barrackpore, Bara kanthaliya, 700121	\N	\N	ORD-419473	RAZORPAY	REFUNDED	order_TaLAG81CyFp4K6	pay_TaLALs3xTqDBCk	Anirban Sasmal	9382269878	REFUNDED	10669.03	2
\.


ALTER TABLE public.orders ENABLE TRIGGER ALL;

--
-- Data for Name: product_coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.product_coupons DISABLE TRIGGER ALL;

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


ALTER TABLE public.product_coupons ENABLE TRIGGER ALL;

--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.product_images DISABLE TRIGGER ALL;

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


ALTER TABLE public.product_images ENABLE TRIGGER ALL;

--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.refunds DISABLE TRIGGER ALL;

COPY public.refunds (id, admin_notes, amount, customer_notes, customer_proof_image, order_id, processed_at, razorpay_payment_id, razorpay_refund_id, reason, requested_at, resolution_type, return_reason_category, return_stage, status, warehouse_inspection_image) FROM stdin;
1	Quality inspection passed. Item returned in resellable/acceptable condition.	41799.05			ORD-554554	Aug 29, 2026 17:26	pay_TVZlXB0LeL4mkX	rfnd_TVZowpQUNw5fyg	Defective or damaged item received	Aug 29, 2026 17:25	REFUND	DEFECTIVE_DAMAGED	REFUNDED	PROCESSED	
2	Quality inspection passed. Item returned in resellable/acceptable condition.	56999.05			ORD-500165	Aug 29, 2026 18:42	pay_TVb3mwSY60IzRF	rfnd_TVb6YG7cBnlcAt	Defective or damaged item received	Aug 29, 2026 18:41	REFUND	DEFECTIVE_DAMAGED	REFUNDED	PROCESSED	
10	Quality inspection passed. Item returned in resellable/acceptable condition.	41799.05			ORD-154636	Sep 10, 2026 18:30	pay_TaKxrT5bmnIjTZ	rfnd_TaLJTRUqqDBfb3	Wrong item delivered by seller	Sep 10, 2026 18:29	REFUND	WRONG_ITEM	REFUNDED	PROCESSED	
3	Quality inspection passed. Item returned in resellable/acceptable condition.	10669.03			ORD-630929	Aug 31, 2026 19:20	pay_TWOh2Nq3y4Pqfu	rfnd_TWOpLcIvrqKXS2	Defective or damaged item received	Aug 31, 2026 19:19	REFUND	DEFECTIVE_DAMAGED	REFUNDED	PROCESSED	
12	Quality inspection passed. Item returned in resellable/acceptable condition.	10669.03			ORD-419473	Sep 10, 2026 18:40	pay_TaLALs3xTqDBCk	rfnd_TaLUkYWZ0IKMB8	Wrong item delivered by seller	Sep 10, 2026 18:39	REFUND	WRONG_ITEM	REFUNDED	PROCESSED	
4	Quality inspection passed. Item returned in resellable/acceptable condition.	143999.1			ORD-854537	Sep 04, 2026 13:33	pay_TXsCKWWWhgH7ML	rfnd_TXt2ltu3kCn5J6	Wrong item delivered by seller	Sep 04, 2026 13:31	REFUND	WRONG_ITEM	REFUNDED	PROCESSED	
\.


ALTER TABLE public.refunds ENABLE TRIGGER ALL;

--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews DISABLE TRIGGER ALL;

COPY public.reviews (id, comment, date, product_id, rating, reviewer_name, user_id) FROM stdin;
\.


ALTER TABLE public.reviews ENABLE TRIGGER ALL;

--
-- Data for Name: settlements; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.settlements DISABLE TRIGGER ALL;

COPY public.settlements (id, commission_amount, commission_percentage, created_at, gross_amount, net_payout_amount, order_id, order_item_id, product_name, settled_at, status, vendor_id) FROM stdin;
1	4179.91	10	Aug 29, 2026	41799.05	37619.14	ORD-554554	1	IQOO NEO 10 5G	\N	REFUNDED	2
2	5699.91	10	Aug 29, 2026	56999.05	51299.14	ORD-500165	2	Apple watch series 11	\N	REFUNDED	2
3	1066.9	10	Aug 31, 2026	10669.03	9602.13	ORD-630929	3	HyperX Headset	\N	REFUNDED	2
4	14399.91	10	Sep 04, 2026	143999.1	129599.19	ORD-854537	7	Iphone 17 Pro Max	\N	REFUNDED	2
8	518.91	10	Sep 04, 2026	5189.1	4670.19	ORD-839090	11	Nike Mens Air Monarch IV	\N	PENDING	2
16	4179.91	10	Sep 10, 2026	41799.05	37619.14	ORD-154636	19	IQOO NEO 10 5G	\N	REFUNDED	2
21	1066.9	10	Sep 10, 2026	10669.03	9602.13	ORD-419473	24	HyperX Headset	\N	REFUNDED	2
\.


ALTER TABLE public.settlements ENABLE TRIGGER ALL;

--
-- Data for Name: stock_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.stock_transfers DISABLE TRIGGER ALL;

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


ALTER TABLE public.stock_transfers ENABLE TRIGGER ALL;

--
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.user_addresses DISABLE TRIGGER ALL;

COPY public.user_addresses (id, address_type, city, full_name, is_default, phone, postal_code, state, street_address, user_id) FROM stdin;
1	HOME	Barrackpore	Anirban Sasmal	t	+919382269878	700121	West Bengal	Singha Roy Boys Mess\nNear Hanuman mandir, Bara Kanthaliya	1
\.


ALTER TABLE public.user_addresses ENABLE TRIGGER ALL;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.users DISABLE TRIGGER ALL;

COPY public.users (id, address, commission_rate, email, full_name, password, phone, role, vendor_code, warehouse_id, warehouse_name) FROM stdin;
1	\N	\N	anirbansasmal21@gmail.com	Anirban Customer	Anirban@021	\N	CUSTOMER	\N	\N	
4	\N	\N	anirban14kolkata@staff	Anirban Staff1	Anirban@0021	\N	WAREHOUSE_STAFF	\N	1	Kolkata Regional Fulfillment Hub (WH-KOL-01)
5	\N	\N	anirban14delhi@staff	Anirban Staff2	Anirban@0069	\N	WAREHOUSE_STAFF	\N	3	Delhi NCR Fulfillment Center (WH-DEL-03)
6	\N	\N	anirban14mumbai@staff	Anirban Staff3	Anirban@014	\N	WAREHOUSE_STAFF	\N	2	Mumbai Central Warehouse (WH-MUM-02)
7	\N	\N	anirban15bangalore@staff	Anirban Staff4	Anirban@0096	\N	WAREHOUSE_STAFF	\N	4	Bangalore Logistics Hub (WH-BLR-04)
3	\N	\N	anirbansasmal40@admin	Anirban Admin	Anirban@040	\N	ADMINISTRATOR	\N	\N	
2	\N	\N	anirbansasmal84@gmail.com	Anirban Vendor	Anirban@084	\N	CUSTOMER	414324	\N	
\.


ALTER TABLE public.users ENABLE TRIGGER ALL;

--
-- Data for Name: vendor_coupon_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.vendor_coupon_approvals DISABLE TRIGGER ALL;

COPY public.vendor_coupon_approvals (id, coupon_code, status, vendor_id) FROM stdin;
1	SAVE20	APPROVED	2
\.


ALTER TABLE public.vendor_coupon_approvals ENABLE TRIGGER ALL;

--
-- Data for Name: warehouse_allocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.warehouse_allocations DISABLE TRIGGER ALL;

COPY public.warehouse_allocations (id, courier_partner, order_id, order_item_id, packaging_type, product_id, quantity, status, tracking_number, updated_at, warehouse_id) FROM stdin;
1	ShopStack Express	ORD-554554	1	Standard Box	1	1	DELIVERED	AWB-60340835	2026-08-29 17:24:44.483042	1
2	ShopStack Express	ORD-500165	2	Standard Box	3	1	DELIVERED	AWB-37608702	2026-08-29 18:40:52.298117	1
3	ShopStack Express	ORD-630929	3	Standard Box	2	1	DELIVERED	SS-948900	2026-08-31 19:13:54.12324	1
4	ShopStack Express	ORD-854537	7	Standard Box	4	1	DELIVERED	AWB-64919554	2026-09-04 13:31:26.750238	1
5	ShopStack Express	ORD-154636	19	Standard Box	1	1	DELIVERED	AWB-64731839	2026-09-10 18:19:27.960221	1
6	ShopStack Express	ORD-419473	24	Standard Box	2	1	DELIVERED	AWB-50748012	2026-09-10 18:25:09.245401	1
\.


ALTER TABLE public.warehouse_allocations ENABLE TRIGGER ALL;

--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public.wishlist_items DISABLE TRIGGER ALL;

COPY public.wishlist_items (id, product_id, user_id) FROM stdin;
\.


ALTER TABLE public.wishlist_items ENABLE TRIGGER ALL;

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

SELECT pg_catalog.setval('public.users_id_seq', 83, true);


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
-- PostgreSQL database dump complete
--

\unrestrict 3XCeoWfu26hort3cmoT5YUESrkJfVCZ4kIy3arCKEdD1QEIhObEVse5quSbCGxc

