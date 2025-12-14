import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { WorkersTable } from '@/components/workers/WorkersTable';
import { WorkerFormDialog } from '@/components/workers/WorkerFormDialog';
import { WorkerProfileDialog } from '@/components/workers/WorkerProfileDialog';
import { useApp } from '@/context/AppContext';
import { Worker } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export default function Workers() {
  const { workers, addWorker, updateWorker, deleteWorker } = useApp();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>();
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');

  const handleAdd = () => {
    setSelectedWorker(undefined);
    setFormMode('add');
    setFormDialogOpen(true);
  };

  const handleView = (worker: Worker) => {
    setSelectedWorker(worker);
    setProfileDialogOpen(true);
  };

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormMode('edit');
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (worker: Worker) => {
    setSelectedWorker(worker);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (workerData: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (formMode === 'add') {
        await addWorker(workerData);
        toast.success('Worker added successfully');
      } else if (selectedWorker) {
        await updateWorker(selectedWorker.id, workerData);
        toast.success('Worker updated successfully');
      }
      setFormDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save worker:', error);
      const message = error.response?.data?.message || 'Failed to save worker. Please try again.';
      toast.error(message);
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err: any) => {
          toast.error(err[0]);
        });
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedWorker) {
      deleteWorker(selectedWorker.id);
      toast.success('Worker deleted successfully');
    }
    setDeleteDialogOpen(false);
  };


  return (
    <Layout title="Workers" subtitle="Manage your organization's workforce">
      <Helmet>
        <title>Workers Directory - Kalvayal</title>
        <meta name="description" content="Manage your organization's workforce" />
      </Helmet>

      <WorkersTable
        workers={workers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAdd={handleAdd}
      />

      {/* Add/Edit Dialog */}
      <WorkerFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        worker={selectedWorker}
        mode={formMode}
      />

      {/* Profile Dialog */}
      {selectedWorker && (
        <WorkerProfileDialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          worker={selectedWorker}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Worker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedWorker?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
