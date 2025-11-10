# Week 2: Daily Implementation Checklist
## Commerce & Marketplace Integration (Nov 15-19, 2025)

---

## Day 6: Medusa Setup - Part 1

### Morning (2 hours)
- [ ] Install Medusa CLI globally
- [ ] Create new Medusa store project
- [ ] Review Medusa project structure
- [ ] Start development server
- [ ] Access admin dashboard at localhost:7000
- [ ] Verify database seeded with sample data

### Afternoon (2 hours)
- [ ] Create Seller model with TypeORM
- [ ] Define seller properties (name, email, phone, description, verified)
- [ ] Create database migration for Seller table
- [ ] Run migration and verify table creation
- [ ] Test seller model with sample data

### Evening (1 hour)
- [ ] Review Medusa service architecture
- [ ] Plan SellerService implementation
- [ ] Document API endpoints needed

**Deliverable:** Medusa project running with Seller model

---

## Day 7: Medusa Setup - Part 2

### Morning (2 hours)
- [ ] Implement SellerService class
- [ ] Create methods: createSeller, getSellerProducts, verifySeller, updateSellerProfile
- [ ] Add error handling and validation
- [ ] Test service methods with sample data

### Afternoon (2 hours)
- [ ] Create Medusa API routes for sellers
- [ ] Implement POST /sellers (create seller)
- [ ] Implement GET /sellers/:id (get seller products)
- [ ] Implement POST /sellers/:id/verify (verify seller)
- [ ] Implement PUT /sellers/:id (update seller)
- [ ] Test all endpoints with Postman

### Evening (1 hour)
- [ ] Integrate Medusa with AANS tRPC
- [ ] Create medusa.ts router
- [ ] Test integration endpoints
- [ ] Document API contracts

**Deliverable:** Medusa API fully integrated with AANS

---

## Day 8: Rasa Chatbot Integration

### Morning (2 hours)
- [ ] Install Rasa framework
- [ ] Create new Rasa project
- [ ] Review Rasa project structure
- [ ] Understand NLU, stories, and actions

### Afternoon (2 hours)
- [ ] Create NLU training data (nlu.yml)
- [ ] Define intents: greet, reservation, menu_inquiry, order, feedback, track_order, payment
- [ ] Add 5-10 examples per intent
- [ ] Create conversation stories (stories.yml)
- [ ] Define story flows for main use cases

### Evening (1 hour)
- [ ] Create domain.yml with intents, entities, slots, responses
- [ ] Create custom actions for API calls
- [ ] Implement ActionConfirmReservation
- [ ] Implement ActionGetMenuItems
- [ ] Implement ActionProcessOrder

**Deliverable:** Rasa model trained and actions configured

---

## Day 9: Keycloak Authentication

### Morning (2 hours)
- [ ] Deploy Keycloak with Docker
- [ ] Access Keycloak admin console
- [ ] Create 'aans' realm
- [ ] Create clients: aans-web, aans-mobile, aans-admin
- [ ] Configure client settings and redirect URIs

### Afternoon (2 hours)
- [ ] Create roles: cafe_manager, ave_admin, seller, customer, support_staff
- [ ] Create test users for each role
- [ ] Assign roles to users
- [ ] Generate client secrets
- [ ] Test login flow manually

### Evening (1 hour)
- [ ] Implement Keycloak middleware for backend
- [ ] Create JWT validation logic
- [ ] Implement requireRole middleware
- [ ] Test protected endpoints
- [ ] Document authentication flow

**Deliverable:** Keycloak fully configured and integrated

---

## Day 10: MinIO File Storage

### Morning (2 hours)
- [ ] Deploy MinIO with Docker
- [ ] Access MinIO console
- [ ] Create buckets: menu-items, cafe-images, user-uploads, documents
- [ ] Configure bucket policies
- [ ] Test file upload manually

### Afternoon (2 hours)
- [ ] Create MinIO client service
- [ ] Implement uploadFile function
- [ ] Implement getFileUrl function
- [ ] Implement deleteFile function
- [ ] Implement listFiles function
- [ ] Test all functions with sample files

### Evening (1 hour)
- [ ] Create upload API routes
- [ ] Integrate with tRPC
- [ ] Test file upload endpoints
- [ ] Test file retrieval endpoints
- [ ] Document file storage architecture

**Deliverable:** MinIO fully operational with AANS integration

---

## Integration Testing Checklist

### Medusa Tests
- [ ] Create seller via API
- [ ] Get seller products
- [ ] Verify seller account
- [ ] Update seller profile
- [ ] Create product
- [ ] Add to cart
- [ ] Complete checkout
- [ ] Get order status

### Rasa Tests
- [ ] Send greeting message
- [ ] Make reservation request
- [ ] Ask for menu items
- [ ] Place order
- [ ] Track order
- [ ] Provide feedback
- [ ] Verify API calls from actions

### Keycloak Tests
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected endpoint with token
- [ ] Access protected endpoint without token
- [ ] Verify role-based access
- [ ] Token refresh
- [ ] Logout

### MinIO Tests
- [ ] Upload image file
- [ ] Upload PDF file
- [ ] Get file URL
- [ ] Delete file
- [ ] List files in bucket
- [ ] Test file permissions
- [ ] Test presigned URLs

---

## Documentation Checklist

- [ ] Medusa API documentation
- [ ] Rasa conversation flows documentation
- [ ] Keycloak setup guide
- [ ] MinIO file storage guide
- [ ] Environment variables guide
- [ ] Integration architecture diagram
- [ ] User authentication flow diagram
- [ ] File upload flow diagram

---

## Deployment Checklist

- [ ] All services running (Medusa, Rasa, Keycloak, MinIO)
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] API routes tested
- [ ] Frontend components updated
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Medusa API response time | < 200ms | ⏳ |
| Rasa intent accuracy | > 95% | ⏳ |
| Keycloak auth latency | < 100ms | ⏳ |
| MinIO upload speed | > 5MB/s | ⏳ |
| All tests passing | 100% | ⏳ |
| Code coverage | > 80% | ⏳ |

---

## Daily Standup Template

**Date:** [Date]  
**Team:** [Names]

### Completed Yesterday
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### In Progress
- [ ] Task: [Description] - [% Complete]

### Blockers
- [ ] Issue: [Description] - [Impact]

### Today's Plan
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

---

## Notes & Issues

### Day 6 Notes
- 

### Day 7 Notes
- 

### Day 8 Notes
- 

### Day 9 Notes
- 

### Day 10 Notes
- 

---

## Time Tracking

| Day | Task | Planned | Actual | Notes |
|-----|------|---------|--------|-------|
| 6 | Medusa Setup | 5h | | |
| 7 | Medusa Integration | 5h | | |
| 8 | Rasa Chatbot | 5h | | |
| 9 | Keycloak Auth | 3h | | |
| 10 | MinIO Storage | 3h | | |
| **Total** | **All Week 2** | **21h** | | |

---

## Sign-Off

**Developer 1:** _________________ Date: _______

**Developer 2:** _________________ Date: _______

**Project Manager:** _________________ Date: _______

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025
