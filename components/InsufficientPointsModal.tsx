import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/router";

/**
 * 积分不足模态框组件属性
 */
interface InsufficientPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

/**
 * 积分不足模态框组件
 * 当接口返回 409 错误时显示
 */
const InsufficientPointsModal: React.FC<InsufficientPointsModalProps> = ({
  isOpen,
  onClose,
  message = "积分不足",
}) => {
  const router = useRouter();

  const handleGoToRecharge = () => {
    onClose();
    void router.push("/checkout");
  };

  return (
    <Modal isOpen={isOpen} shouldBlockScroll={false} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <span>积分不足</span>
        </ModalHeader>
        <ModalBody>
          <p className="text-foreground/80">{message}</p>
          <p className="mt-2 text-sm text-foreground/60">
            您当前的积分不足以完成此操作，请充值后再试。
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            onPress={handleGoToRecharge}
          >
            去充值
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InsufficientPointsModal;
