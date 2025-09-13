// File Path: src/lib/auditLog.js
import AuditLog from '@/models/AuditLog';
import { connectDB } from '@/lib/dbConnect';

/**
 * Centralized function to log audit events.
 * This service provides a single, consistent way to record financial
 * activities from anywhere in the application. It connects to the database
 * and creates a new document in the AuditLog collection.
 * * @param {object} details - An object containing all the necessary information for the audit log entry.
 * @param {string} [details.chamaId] - The ID of the Chama related to the event.
 * @param {string} [details.userId] - The ID of the user who is the subject of the action.
 * @param {string} [details.adminId] - The ID of the admin/privileged user performing the action.
 * @param {string} details.action - A specific, machine-readable identifier for the event.
 * @param {string} details.category - A broad classification for the action.
 * @param {number} [details.amount] - The financial value of the event.
 * @param {string} details.description - A human-readable summary of the event.
 * @param {object} [details.before] - A snapshot of data before a change.
 * @param {object} [details.after] - A snapshot of data after a change.
 */
export async function logAuditEvent(details) {
  try {
    // Ensure the database connection is established.
    await connectDB();
    
    // Create the audit log entry.
    await AuditLog.create(details);
    
    console.log(`Audit event logged: ${details.action}`);

  } catch (error) {
    // Log any errors to the console. In a production environment,
    // this would be logged to a dedicated error tracking service.
    console.error('CRITICAL: Failed to log audit event:', {
      details,
      error: error.message
    });
    // We don't re-throw the error to prevent the main application logic
    // from failing if only the audit logging fails.
  }
}

