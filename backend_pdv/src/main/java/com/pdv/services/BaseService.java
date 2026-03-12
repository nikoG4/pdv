package com.pdv.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.lang.reflect.ParameterizedType;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.pdv.models.Auditable;
import com.pdv.models.Log;
import com.pdv.models.User;
import com.pdv.repositories.BaseRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;

@Service
public abstract class BaseService<T> {

    @Autowired
    protected UserInfoService userInfoService;

    @Autowired
    private LogService logService;

    @Autowired 
    private ResourceLoader resourceLoader;

    @Autowired
    private DataSource dataSource;

    @Autowired
    protected BaseRepository<T, Long> repository;

    @Autowired
    private EntityManager entityManager;

    protected List<String> columns = new ArrayList<>();
    protected List<String> relatedColumns = new ArrayList<>();
    protected String relatedEntity = null;
    

    public Page<T> findAll(Pageable pageable) {
       return repository.findAll(pageable);
    }

    public List<T> findAll() {
        return repository.findAll();
     }

    public Page<T> findActive(Pageable pageable) {
        return repository.findByDeletedAtIsNull(pageable); 
    }

    public T save(T t) {

        User user = userInfoService.getCurrentUser();
        
        ((Auditable) t).setCreatedBy(user);

        T tSaved = repository.save(t);

        log("create", tSaved.toString(), null, user);
        
        return t;
    }

    public Optional<T> findById(Long id) {
        return repository.findById(id);
    }

    public abstract T update(T t, Long id);

    public void delete(T t) {
        User user = userInfoService.getCurrentUser();
        ((Auditable) t).setDeletedBy(user);

        log("delete", null, t.toString(), user );

        repository.save(t);
    }

    public void log(String action, String newData, String oldData, User user) {
        new Thread(()->{
            Log log = new Log();
            log.setAction(action);
            log.setDate(LocalDateTime.now());
            log.setNewData(newData);
            log.setOldData(oldData);
            log.setUser(user);
            logService.save(log);
        }).start();
    }

    public ByteArrayInputStream generatePdfReport(String reportPath, Map<String, Object> parameters) {
        try {
            Resource resource = resourceLoader.getResource("classpath:" + reportPath);
            InputStream reportStream = resource.getInputStream();

            JasperPrint jasperPrint = JasperFillManager.fillReport(reportStream, parameters, dataSource.getConnection());

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);

            return new ByteArrayInputStream(outputStream.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el reporte", e);
        }
    }

    public Page<T> search(String searchTerm, Pageable pageable) {
        // Crear la especificación
        Specification<T> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> likePredicates = new ArrayList<>();

            // Añadir condiciones para cada columna
            for (String column : columns) {
                likePredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get(column).as(String.class)), "%" + searchTerm.toLowerCase() + "%"));
            }

            // Si hay columnas relacionadas, añadimos el join
            if (!relatedColumns.isEmpty() && relatedEntity != null) {
                Join<Object, Object> relatedJoin = root.join(relatedEntity);

                for (String relatedColumn : relatedColumns) {
                    likePredicates.add(criteriaBuilder.like(criteriaBuilder.lower(relatedJoin.get(relatedColumn).as(String.class)), "%" + searchTerm.toLowerCase() + "%"));
                }
            }


            Predicate likePredicate = criteriaBuilder.or(likePredicates.toArray(new Predicate[0]));

            // Solo incluir registros donde deletedAt es NULL
            Predicate deletedAtPredicate = criteriaBuilder.isNull(root.get("deletedAt"));


            return criteriaBuilder.and(likePredicate, deletedAtPredicate);
        };
        
        @SuppressWarnings("unchecked")
        Class<T> entityClass = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass()).getActualTypeArguments()[0];
        
        // Crear la consulta
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<T> criteriaQuery = cb.createQuery(entityClass);
        Root<T> root = criteriaQuery.from(entityClass);
        
        criteriaQuery.select(root).where(spec.toPredicate(root, criteriaQuery, cb));
        
        // Aplicar paginación
        var typedQuery = entityManager.createQuery(criteriaQuery);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<T> results = typedQuery.getResultList();

        // Contar total de registros
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        countQuery.select(cb.count(countQuery.from(entityClass)));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(results, pageable, total);
    }

}
