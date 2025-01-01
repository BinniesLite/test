import CustomModal from '@/components/custom-modal';
import { CustomFormField } from '@/components/CustomFormField';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChapterFormData, chapterSchema } from '@/lib/schemas';
import { closeChapterModal } from '@/state';
import { useAppDispatch, useAppSelector } from '@/state/redux'
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { addChapter, editChapter } from '@/state';
import { toast } from 'sonner';

import { v4 as uuidv4} from "uuid";

const ChapterModal = () => {
  const dispatch = useAppDispatch();

  const {
    isChapterModalOpen,
    selectedChapterIndex,
    selectedSectionIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);

  const chapter: Chapter | undefined =
    selectedSectionIndex !== null && selectedChapterIndex !== null
      ? sections[selectedSectionIndex].chapters[selectedChapterIndex]
      : undefined;

  const methods = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      content: "",
      video: ""
    }
  })

  useEffect(() => {
    if (chapter) {
      methods.reset({
        title: chapter.title,
        content: chapter.content,
        video: chapter.video || "",
      });
    } else {
      methods.reset({
        title: "",
        content: "",
        video: "",
      });
    }
  }, [chapter, methods]);

  const onClose = () => {
    dispatch(closeChapterModal());
  }

  const onSubmit = (data: ChapterFormData) => {
    if (selectedSectionIndex === null) return;

    const newChapter: Chapter = {
      chapterId: chapter?.chapterId || uuidv4(),
      title: data.title,
      content: data.content,
      type: data.video ? "Video" : "Text",
      video: data.video,
    };

    if (selectedChapterIndex === null) {
      dispatch(
        addChapter({
          sectionIndex: selectedSectionIndex,
          chapter: newChapter,
        })
      );
    } else {
      dispatch(
        editChapter({
          sectionIndex: selectedSectionIndex,
          chapterIndex: selectedChapterIndex,
          chapter: newChapter,
        })
      );
    }

    toast.success(
      `Chapter added/updated successfully but you need to save the course to apply the changes`
    );
    onClose();
  };
  return (
    <CustomModal isOpen={isChapterModalOpen} onClose={onClose}>
      <div className="section-modal">
        <div className="section-modal__header">
          <h2 className="section-modal__title">Add/Edit Chapter</h2>
          <button onClick={onClose} className="section-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <Form {...methods}>
        <form 
          onSubmit={methods.handleSubmit(onSubmit)}
          className='chapter-modal__form'
        >
          <div className='flex-row justify-between space-y-6'>
            <CustomFormField
              name="title"
              label="Chapter title"
              type="text"
              placeholder="Chapter title"
              className="border-none"
              initialValue={""}
            />
            <CustomFormField
              name="content"
              label="Chapter Content"
              type="textarea"
              placeholder="Chapter content"
              className="border-none"
              initialValue={""}
            />

            <FormField
              control={methods.control}
              name="video"
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel className="text-customgreys-dirtyGrey text-sm">
                    Chapter Video
                  </FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        className="border-none bg-customgreys-darkGrey py-2 cursor-pointer"
                      />
                      {typeof value === "string" && value && (
                        <div className="my-2 text-sm text-gray-600">
                          Current video: {value.split("/").pop()}
                        </div>
                      )}
                      {value instanceof File && (
                        <div className="my-2 text-sm text-gray-600">
                          Selected file: {value.name}
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
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

export default ChapterModal