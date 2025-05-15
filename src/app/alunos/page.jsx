"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Pagination, Modal, Card, Skeleton } from "antd";
import { ToastContainer, toast } from "react-toastify";
import { getSessionsStorage, setSessionsStorage } from "@/utils/sectionStorage";
import Image from "next/image";
import styles from "../alunos/Alunos.module.css";

const HEADERS = { "x-api-key": process.env.NEXT_PUBLIC_API_KEY };

export default function Alunos() {
    const [data, setData] = useState({
        alunos: [],
        loading: true,
        current: 1,
        pageSize: 5,
    });

    const [modalInfo, setModalInfo] = useState({
        visible: false,
        aluno: null,
        avaliacao: null,
        loading: false,
    });

    useEffect(() => {
        const fetchAlunos = async () => {
            const cached = getSessionsStorage("alunosData", []);
            if (cached.length > 0) {
                setData({ alunos: cached, loading: false, current: 1, pageSize: 5 });
                return;
            }
            try {
                const { data: alunos } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/estudantes`,
                    {
                        headers: HEADERS,
                    }
                );
                setSessionsStorage("alunosData", alunos);
                setData({ alunos, loading: false, current: 1, pageSize: 5 });
            } catch (error) {
                toast.error("Erro ao carregar alunos");
                setData((d) => ({ ...d, loading: false }));
            }
        };
        fetchAlunos();
    }, []);

    const openModal = async (aluno) => {
        setModalInfo({ visible: true, aluno, avaliacao: null, loading: true });

        const cacheKey = `avaliacao_${aluno.id}`;
        const cached = getSessionsStorage(cacheKey, null);
        if (cached) {
            setModalInfo((m) => ({ ...m, avaliacao: cached, loading: false }));
            return;
        }

        try {
            const { data: avaliacao } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/avaliacao/${aluno.id}`,
                {
                    headers: HEADERS,
                }
            );
            setSessionsStorage(cacheKey, avaliacao);
            setModalInfo((m) => ({ ...m, avaliacao, loading: false }));
        } catch {
            toast.error("Erro ao carregar avaliação.");
            setModalInfo((m) => ({ ...m, loading: false }));
        }
    };

    const paginatedAlunos = () => {
        const start = (data.current - 1) * data.pageSize;
        return data.alunos.slice(start, start + data.pageSize);
    };

    return (
        <div>
            <ToastContainer />
            <h1>Lista de Alunos</h1>
            <Pagination
                current={data.current}
                pageSize={data.pageSize}
                total={data.alunos.length}
                onChange={(page, size) =>
                    setData((d) => ({ ...d, current: page, pageSize: size }))
                }
                showSizeChanger
                pageSizeOptions={["5", "10", "100"]}
            />
            {data.loading ? (
                <Image
                    src="/image/loading.gif"
                    width={100}
                    height={100}
                    alt="Loading"
                />
            ) : (
                <div className={styles.cardsContainer}>
                    {paginatedAlunos().map((aluno) => (
                        <Card
                            key={aluno.id}
                            className={styles.card}
                            hoverable
                            onClick={() => openModal(aluno)}
                            cover={
                                <Image
                                    src={aluno.foto}
                                    alt={aluno.nome}
                                    width={100}
                                    height={100}
                                    className={styles.image}
                                />
                            }
                        >
                            <Card.Meta title={aluno.name_estudante} 
                            />
                        </Card>
                    ))}
                    </div>
            )}
                      <Modal
        title={`Avaliação de ${modalInfo.aluno?.name_estudante}`}
        open={modalInfo.visible}
        onCancel={() =>
          setModalInfo({
            visible: false,
            aluno: null,
            avaliacao: null,
            loading: false,
          })
        }
        onOk={() =>
          setModalInfo({
            visible: false,
            aluno: null,
            avaliacao: null,
            loading: false,
          })
        }
        width={600}
      >
        {modalInfo.loading ? (
          <Skeleton active />
        ) : modalInfo.avaliacao ? (
          <div className={styles.avaliacaoInfo}>
            <p>
              <span className={styles.label}>Nota:</span>{" "}
              {modalInfo.avaliacao.nota}
            </p>
            <p>
              <span className={styles.label}>Professor:</span>{" "}
              {modalInfo.avaliacao.professor}
            </p>
            <p>
              <span className={styles.label}>Matéria:</span>{" "}
              {modalInfo.avaliacao.materia}
            </p>
            <p>
              <span className={styles.label}>Sala:</span>{" "}
              {modalInfo.avaliacao.sala}
            </p>
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>Avaliação não encontrada.</p>
        )}
      </Modal>
    </div>
  );
}