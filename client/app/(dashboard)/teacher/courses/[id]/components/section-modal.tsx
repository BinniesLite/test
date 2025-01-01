import CustomModal from '@/components/custom-modal'
import { useAppDispatch, useAppSelector } from '@/state/redux'
import { X } from 'lucide-react'
import React, { useEffect } from 'react'
import { addSection, closeSectionModal, editSection } from '@/state'
import { SectionFormData, sectionSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { CustomFormField } from '@/components/CustomFormField'
import { Button } from '@/components/ui/button'
import { useUpdateCourseMutation } from '@/state/api'
import { v4 as uuidv4 } from "uuid";
import { toast } from 'sonner'

const SectionModal = () => {
    const dispatch = useAppDispatch();
    const { isSectionModalOpen, selectedSectionIndex, sections } = useAppSelector(
        (state) => state.global.courseEditor
    )


    const section =
        selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

    const methods = useForm<SectionFormData>({
        resolver: zodResolver(sectionSchema),
        defaultValues: {
            title: "",
            description: ""
        }
    })

    useEffect(() => {
        if (section) {
            methods.reset({
                title: section.sectionTitle,
                description: section.sectionDescription,
            });
        } else {
            methods.reset({
                title: "",
                description: "",
            });
        }
    }, [section, methods]);

    const onSubmit = async (data: SectionFormData) => {
        const newSection: Section = {
            sectionId: section?.sectionId || uuidv4(),
            sectionTitle: data.title,
            sectionDescription: data.description,
            chapters: section?.chapters || [],
        }

        if (selectedSectionIndex === null) {
            dispatch(addSection(newSection));
        } else {
            dispatch(
                editSection({
                    index: selectedSectionIndex,
                    section: newSection,
                })
            );
        }

        toast.success(
            `Section added/updated successfully but you need to save the course to apply the changes`
        );
        onClose();
    }


    const onClose = () => {
        dispatch(closeSectionModal());
    }

    return (
        <CustomModal isOpen={isSectionModalOpen} onClose={onClose}>
            <div className="section-modal">
                <div className="section-modal__header">
                    <h2 className="section-modal__title">Add/Edit Section</h2>
                    <button onClick={onClose} className="section-modal__close">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <Form {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <div className='flex-row justify-between space-y-6'>
                        <CustomFormField
                            name="title"
                            label="Section title"
                            type="text"
                            placeholder="Section title"
                            className="border-none"
                            initialValue={""}
                        />
                        <CustomFormField
                            name="description"
                            label="Section Description"
                            type="textarea"
                            placeholder="Section title"
                            className="border-none"
                            initialValue={""}
                        />

                        <div className='flex justify-end gap-4'>
                            <Button className='outline' onClick={onClose}>
                                Cancel
                            </Button>
                            <Button className='bg-primary-700' type="submit">
                                Save
                            </Button>
                        </div>

                    </div>


                </form>
            </Form>
        </CustomModal>
    )
}

export default SectionModal