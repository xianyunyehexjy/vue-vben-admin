import { UseModalReturnType, ModalInstance, ModalProps, ReturnMethods } from './types';
import { ref, Ref, getCurrentInstance, onUnmounted, unref, onMounted } from 'compatible-vue';

import { isProdMode } from '@/utils/envUtil';

/**
 * @description: 适用于将modal独立出去,外面调用
 */
export function useModal(): UseModalReturnType {
  if (!getCurrentInstance()) {
    throw new Error('Please put useModal function in the setup function!');
  }
  const modalRef = ref<ModalInstance | null>(null);
  const loadedRef = ref<boolean | null>(false);
  const isFirstLoadRef = ref<boolean | null>(true);
  let innerProps: any = null;
  onMounted(() => {
    console.log('onMounted', innerProps, isFirstLoadRef.value);
  });

  onUnmounted(() => {
    console.log('onUnmounted--start', innerProps, isFirstLoadRef.value);

    modalRef.value = null;
    loadedRef.value = null;
    isFirstLoadRef.value = null;
    innerProps = null;
    console.log('onUnmounted--end', innerProps, isFirstLoadRef.value);
  });
  function register(modalInstance: ModalInstance) {
    if (unref(loadedRef) && isProdMode()) {
      return;
    }
    modalRef.value = modalInstance;
    loadedRef.value = true;

    console.log('register', innerProps, isFirstLoadRef.value);

    unref(modalRef)!.setModalProps(innerProps || {});
  }
  const methods: ReturnMethods = {
    /**
     * @description: 设置modal参数
     */
    setModalProps: (props: Partial<ModalProps>): void => {
      unref(modalRef)!.setModalProps(props);
    },
    isFirstLoadRef: isFirstLoadRef as Ref<boolean>,
    openModal: (props: Partial<ModalProps>): void => {
      if (unref(isFirstLoadRef)) {
        isFirstLoadRef.value = false;
        innerProps = props;
      } else {
        unref(modalRef)!.setModalProps(props);
      }
      console.log('openModal', innerProps, isFirstLoadRef.value);
    },
  };
  return [register, methods];
}

export const useModalExt = (emit: (event: string, ...args: any[]) => void) => {
  const modalInstallRef = ref<ModalInstance | null>(null);
  return {
    register: (modalInstance: ModalInstance) => {
      modalInstallRef.value = modalInstance;
      emit('register', modalInstance);
    },
    modalInstallRef,
  };
};
/**
 * @description: 外部独立组件内使用
 */
export const useModalOnInner = () => {
  const visibleRef = ref(false);
  const confirmLoadingRef = ref(false);
  const wrapperLoadingRef = ref(false);

  const hiddenModal = () => {
    visibleRef.value = false;
  };
  const showModal = () => {
    visibleRef.value = true;
  };

  return {
    visibleRef,
    confirmLoadingRef,
    wrapperLoadingRef,
    hiddenModal,
    showModal,
  };
};
