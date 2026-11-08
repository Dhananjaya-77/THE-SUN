import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as residentialController from '../controllers/residential.controller.js';

const router = Router();

router.get('/summary', residentialController.getSummary);
router.get('/schemes', residentialController.getSchemes);

router.get('/customers', residentialController.getCustomers);
router.post('/customers', validate(residentialController.createCustomerSchema), residentialController.createCustomer);

router.get('/sites', residentialController.getSites);
router.post('/sites', validate(residentialController.createSiteSchema), residentialController.createSite);
router.get('/sites/:id', residentialController.getSiteById);

router.post('/measurements', validate(residentialController.createMeasurementSchema), residentialController.ingestMeasurement);
router.get('/measurements', residentialController.getMeasurements);

router.get('/credits/:siteId', residentialController.getCredits);
router.post('/credits', validate(residentialController.createCreditSchema), residentialController.createCredit);

export default router;
